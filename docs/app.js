/* Asuna 管理台 —— 纯静态 SPA
 * 匿名可浏览；PAT 登录 + 仓库写权限者可编辑。
 * 数据唯一真源：仓库内 data.json（Contents API 提交，SHA 乐观锁）。
 */
(function () {
  "use strict";

  var CFG = window.ASUNA_CONFIG;

  // ---------- 基础工具 ----------
  function $(sel) { return document.querySelector(sel); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }
  function toast(msg, isErr) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "show" + (isErr ? " err" : "");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.className = ""; }, 3200);
  }

  // base64（UTF-8 安全）
  function b64encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  // ---------- 与 Go 端一致的校验规则 ----------
  var REPO_URL_RE = /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.(?:git))?(?:[\/?#].*)?$/i;
  var INVALID_SEGMENT = /["'`\[\]{}<>|#\\]|[\r\n]/;

  var LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219",
    Go: "#00ADD8", Rust: "#dea584", C: "#555555", "C++": "#f34b7d", "C#": "#178600",
    Shell: "#89e051", Kotlin: "#A97BFF", Swift: "#F05138", Ruby: "#701516",
    PHP: "#4F5D95", Vue: "#41b883", HTML: "#e34c26", CSS: "#563d7c",
    Jinja: "#a52a22", Dart: "#00B4AB", Lua: "#000080", Zig: "#ec915c"
  };

  function canonicalRepoURL(u) {
    var m = REPO_URL_RE.exec((u || "").trim());
    if (!m) return null;
    return "https://github.com/" + m[1] + "/" + m[2].replace(/\.git$/i, "");
  }

  function sanitizeSegment(s) {
    s = (s || "").trim();
    if (!s) return "分类名不能为空";
    if (s.length > 60) return "分类名过长（>60）";
    if (INVALID_SEGMENT.test(s)) return "分类名含非法字符：| \" ' ` [ ] { } < > # \\ 及换行";
    return null;
  }

  // ---------- 全局状态 ----------
  var state = {
    db: [],
    sha: null,
    dirty: false,
    token: localStorage.getItem("asuna_token") || "",
    user: null,
    canEdit: false,
    selectedPath: [],
    stars: {},          // docs/stars.json 快照
    query: "",          // 搜索关键词
    starCache: JSON.parse(localStorage.getItem("asuna_starcache") || "{}"),
    starFetchBudget: 30, // 本次会话匿名 API 配额保护
  };

  var API = "https://api.github.com";
  var RAW = "https://raw.githubusercontent.com/" + CFG.OWNER + "/" + CFG.REPO + "/" + CFG.BRANCH;

  function fetchFirst(urls) {
    return urls.reduce(function (chain, url) {
      return chain.catch(function () { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r; }); });
    }, Promise.reject());
  }

  function gh(path, opts) {
    opts = opts || {};
    var headers = { Accept: "application/vnd.github+json" };
    if (state.token) headers.Authorization = "token " + state.token;
    if (opts.body) headers["Content-Type"] = "application/json";
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      if (!r.ok) {
        var err = new Error("GitHub API " + r.status);
        err.status = r.status;
        throw err;
      }
      return r.json();
    });
  }

  // ---------- 数据读写 ----------
  function loadDB() {
    return fetchFirst([RAW + "/data.json"]).then(function (r) { return r.json(); }).then(function (db) {
      state.db = db;
      state.dirty = false;
      renderTree();
      renderPanel();
    });
  }

  function refreshSHA() {
    if (!state.token) return Promise.resolve();
    return gh("/repos/" + CFG.OWNER + "/" + CFG.REPO + "/contents/data.json?ref=" + CFG.BRANCH)
      .then(function (d) { state.sha = d.sha; })
      .catch(function () { state.sha = null; });
  }

  function saveAll() {
    if (!state.canEdit || !state.dirty) return;
    var btn = $("#saveBtn");
    btn.disabled = true;
    btn.textContent = "保存中…";
    refreshSHA().then(function () {
      if (!state.sha) throw new Error("无法获取 data.json 的 SHA");
      return gh("/repos/" + CFG.OWNER + "/" + CFG.REPO + "/contents/data.json", {
        method: "PUT",
        body: {
          message: "web: 更新收录（by @" + (state.user ? state.user.login : "?") + "）",
          content: b64encode(JSON.stringify(state.db, null, 2) + "\n"),
          sha: state.sha,
          branch: CFG.BRANCH,
        },
      });
    }).then(function (d) {
      state.sha = d.content && d.content.sha;
      state.dirty = false;
      toast("✅ 已提交，README 将由 CI 自动刷新");
      renderTree(); renderPanel();
    }).catch(function (e) {
      if (e.status === 409 || e.status === 422) {
        toast("⚠️ 数据已被他人更新，正在重新加载，请重做未保存的修改", true);
        loadDB().then(refreshSHA);
      } else if (e.status === 403) {
        toast("❌ 无推送权限：请确认 Token 已授予本仓库 Contents 写权限", true);
      } else {
        toast("❌ 保存失败：" + e.message, true);
      }
    }).finally(function () {
      btn.disabled = false;
      updateChrome();
    });
  }

  // ---------- PAT 登录 ----------
  function showTokenDialog() { $("#tokenBox").style.display = "flex"; $("#tokenInput").focus(); }
  function hideTokenDialog() { $("#tokenBox").style.display = "none"; $("#tokenInput").value = ""; }

  function loginWithToken() {
    var tok = $("#tokenInput").value.trim();
    if (!tok) { toast("请粘贴 Token", true); return; }
    var prev = state.token;
    state.token = tok;
    $("#tokenSave").disabled = true;
    gh("/user").then(function (u) {
      state.user = u;
      return gh("/repos/" + CFG.OWNER + "/" + CFG.REPO);
    }).then(function (r) {
      state.canEdit = !!(r.permissions && r.permissions.push);
      localStorage.setItem("asuna_token", tok);
      hideTokenDialog();
      updateChrome();
      refreshSHA();
      toast("欢迎，" + state.user.login + (state.canEdit ? "（编辑者）" : "（只读：无推送权限）"));
    }).catch(function (e) {
      state.token = prev;
      state.user = null;
      state.canEdit = false;
      toast("登录失败：" + (e.status === 401 ? "Token 无效或已过期" : e.message), true);
    }).finally(function () {
      $("#tokenSave").disabled = false;
    });
  }

  function logout() {
    state.token = "";
    state.user = null;
    state.canEdit = false;
    localStorage.removeItem("asuna_token");
    updateChrome();
    toast("已退出");
  }

  function restoreSession() {
    if (!state.token) return Promise.resolve();
    return gh("/user").then(function (u) {
      state.user = u;
      return gh("/repos/" + CFG.OWNER + "/" + CFG.REPO);
    }).then(function (r) {
      state.canEdit = !!(r.permissions && r.permissions.push);
    }).catch(function () {
      state.token = "";
      state.user = null;
      state.canEdit = false;
    });
  }

  // ---------- 树操作（纯内存，保存时统一提交）----------
  function getNodeByPath(path) {
    var nodes = state.db;
    var found = null;
    for (var i = 0; i < path.length; i++) {
      found = null;
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].name === path[i]) { found = nodes[j]; break; }
      }
      if (!found) return null;
      nodes = found.children || (found.children = []);
    }
    return found;
  }

  function ensureNode(path) {
    var nodes = state.db;
    var node = null;
    path.forEach(function (name) {
      node = null;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) { node = nodes[i]; break; }
      }
      if (!node) {
        node = { name: name };
        nodes.push(node);
      }
      nodes = node.children || (node.children = []);
    });
    return node;
  }

  function getAllPaths(nodes, prefix) {
    var out = [];
    (nodes || []).forEach(function (n) {
      var curr = prefix ? prefix + " / " + n.name : n.name;
      out.push(curr);
      out = out.concat(getAllPaths(n.children, curr));
    });
    return out;
  }

  function containsProject(nodes, url) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      for (var j = 0; j < (n.projects || []).length; j++) {
        if ((n.projects[j].url || "").toLowerCase() === url.toLowerCase()) return true;
      }
      if (containsProject(n.children, url)) return true;
    }
    return false;
  }

  function pruneEmpty(nodes) {
    var kept = [];
    (nodes || []).forEach(function (n) {
      pruneEmpty(n.children);
      if ((n.projects || []).length === 0 && (n.children || []).length === 0) return;
      kept.push(n);
    });
    nodes.length = 0;
    kept.forEach(function (n) { nodes.push(n); });
  }

  function markDirty() {
    state.dirty = true;
    updateChrome();
  }

  // ---------- 编辑动作 ----------
  var fetchedMeta = null;

  function fetchMeta() {
    var raw = $("#inUrl").value;
    var parts = REPO_URL_RE.exec(raw.trim());
    if (!parts) { toast("URL 无效：需为 github.com/owner/repo 形式", true); return; }
    $("#metaCard").hidden = false;
    $("#metaBody").textContent = "获取中…";
    gh("/repos/" + parts[1] + "/" + parts[2]).then(function (d) {
      fetchedMeta = d;
      $("#metaBody").textContent = "";
      $("#metaBody").appendChild(el("strong", { text: d.full_name }));
      $("#metaBody").appendChild(document.createTextNode(
        "   ★ " + d.stargazers_count + " · " + (d.language || "未知语言") +
        (d.description ? "\n" + d.description : "")));
    }).catch(function (e) {
      fetchedMeta = null;
      $("#metaBody").textContent = "获取失败：" + (e.status === 403 ? "API 限流，稍后再试" : "仓库不存在或不可访问");
    });
  }

  function cleanDesc(desc) {
    if (!desc) return "";
    var ta = document.createElement("textarea");
    ta.innerHTML = desc;
    desc = ta.value;
    desc = desc.replace(/\r/g, "").replace(/\n/g, " ").replace(/\|/g, "\\|");
    return desc.trim();
  }

  function addProject() {
    if (!fetchedMeta) { toast("请先获取仓库信息", true); return; }
    var pathStr = $("#selCategory").value;
    if (!pathStr) { toast("请选择分类", true); return; }
    if (containsProject(state.db, fetchedMeta.html_url)) {
      toast("该项目已收录，请勿重复添加", true);
      return;
    }
    var node = ensureNode(pathStr.split(" / "));
    node.projects = node.projects || [];
    node.projects.push({
      name: fetchedMeta.name,
      url: fetchedMeta.html_url,
      description: cleanDesc(fetchedMeta.description),
      language: fetchedMeta.language || "",
      stars: fetchedMeta.stargazers_count,
    });
    markDirty();
    state.selectedPath = pathStr.split(" / ");
    state.query = "";
    $("#searchInput").value = "";
    renderTree(); renderPanel();
    $("#metaCard").hidden = true;
    $("#inUrl").value = "";
    toast("已暂存：「" + fetchedMeta.name + "」，点击右上角「保存更改」生效");
  }

  function deleteProject(node, url) {
    if (!confirm("确认删除项目？保存后生效。")) return;
    node.projects = (node.projects || []).filter(function (p) { return p.url !== url; });
    pruneEmpty(state.db);
    markDirty();
    renderTree(); renderPanel();
  }

  function moveProject(node, idx, newPath) {
    var p = node.projects.splice(idx, 1)[0];
    var target = ensureNode(newPath.split(" / "));
    target.projects = target.projects || [];
    target.projects.push(p);
    pruneEmpty(state.db);
    markDirty();
    renderTree(); renderPanel();
    toast("已移动到「" + newPath + "」（未保存）");
  }

  function addCategory(parentPath) {
    var name = prompt(parentPath && parentPath.length ? "子分类名称：" : "根分类名称：");
    if (name === null) return;
    var err = sanitizeSegment(name);
    if (err) { toast(err, true); return; }
    ensureNode((parentPath || []).concat([name]));
    markDirty();
    state.selectedPath = (parentPath || []).concat([name]);
    renderTree(); renderPanel();
  }

  function deleteCategory(path) {
    var node = getNodeByPath(path);
    if (!node) return;
    if ((node.projects || []).length || (node.children || []).length) {
      toast("只能删除空分类", true);
      return;
    }
    if (!confirm("删除空分类「" + path.join(" / ") + "」？")) return;
    if (path.length === 1) {
      state.db = state.db.filter(function (n) { return n.name !== path[0]; });
    } else {
      var parent = getNodeByPath(path.slice(0, -1));
      parent.children = (parent.children || []).filter(function (n) { return n.name !== path[path.length - 1]; });
    }
    markDirty();
    state.selectedPath = [];
    renderTree(); renderPanel();
  }

  // ---------- Star 显示与懒加载 ----------
  function starOf(p) {
    if (p.stars != null) return p.stars;
    var c = state.starCache[p.url];
    if (c && Date.now() - c.t < 86400e3) return c.s;
    return null;
  }

  function fmtStars(n) {
    if (n == null) return "…";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function lazyFetchStars() {
    var missing = [];
    document.querySelectorAll("td.stars[data-url]").forEach(function (td) {
      if (td.textContent === "…") missing.push(td);
    });
    missing = missing.slice(0, 10);
    function next() {
      if (!missing.length || state.starFetchBudget <= 0) return;
      var td = missing.shift();
      var url = td.getAttribute("data-url");
      var parts = REPO_URL_RE.exec(url);
      if (!parts) { td.textContent = "-"; return; }
      state.starFetchBudget--;
      gh("/repos/" + parts[1] + "/" + parts[2]).then(function (d) {
        state.starCache[url] = { s: d.stargazers_count, t: Date.now() };
        localStorage.setItem("asuna_starcache", JSON.stringify(state.starCache));
        td.textContent = fmtStars(d.stargazers_count);
      }).catch(function () { td.textContent = "-"; })
        .finally(next);
    }
    next();
  }

  // ---------- 渲染 ----------
  function updateChrome() {
    var loginBtn = $("#loginBtn"), userChip = $("#userChip"), saveBtn = $("#saveBtn");
    if (state.user) {
      loginBtn.hidden = true;
      userChip.hidden = false;
      $("#userName").textContent = state.user.login + (state.canEdit ? " · 编辑者" : " · 只读");
      if (state.user.avatar_url) $("#userAvatar").src = state.user.avatar_url + "&s=40";
    } else {
      loginBtn.hidden = false;
      loginBtn.textContent = state.token ? "重新登录" : "🔑 登录编辑";
      userChip.hidden = true;
    }
    saveBtn.hidden = !(state.canEdit && state.dirty);
    saveBtn.textContent = state.dirty ? "💾 保存更改" : "保存";
    $("#editorBar").hidden = !state.canEdit;
    $("#searchInput").hidden = false;
  }

  function isActive(p) { return p.join("/") === state.selectedPath.join("/"); }

  function countProjects(n) {
    var c = (n.projects || []).length;
    (n.children || []).forEach(function (ch) { c += countProjects(ch); });
    return c;
  }

  function renderTree() {
    var box = $("#treeScroll");
    box.textContent = "";

    function draw(nodes, path, level) {
      (nodes || []).forEach(function (n) {
        var p = path.concat([n.name]);
        var row = el("div", {
          class: "tree-row lv" + level + (isActive(p) ? " active" : ""),
          onclick: (function (pp) { return function () { state.selectedPath = pp; state.query = ""; $("#searchInput").value = ""; renderTree(); renderPanel(); }; })(p),
        });
        row.appendChild(el("span", { class: "tree-name", text: n.name }));
        row.appendChild(el("span", { class: "count", text: String(countProjects(n)) }));

        if (state.canEdit) {
          var ops = el("span", { class: "ops" });
          ops.appendChild(el("a", { text: "+子类", onclick: (function (pp) { return function (e) { e.stopPropagation(); addCategory(pp); }; })(p) }));
          if ((n.projects || []).length === 0 && (n.children || []).length === 0) {
            ops.appendChild(el("a", { class: "del", text: "删", onclick: (function (pp) { return function (e) { e.stopPropagation(); deleteCategory(pp); }; })(p) }));
          }
          row.appendChild(ops);
        }
        box.appendChild(row);
        draw(n.children, p, Math.min(level + 1, 3));
      });
    }
    draw(state.db, [], 0);

    if (state.canEdit) {
      box.appendChild(el("button", { class: "btn ghost sm block", text: "＋ 新增根分类", onclick: function () { addCategory([]); } }));
    }
  }

  function langCell(lang) {
    var td = el("td", { class: "muted" });
    if (lang) {
      td.appendChild(el("span", { class: "lang-dot" })).style.background = LANG_COLORS[lang] || "#8b949e";
      td.appendChild(document.createTextNode(lang));
    } else {
      td.textContent = "-";
    }
    return td;
  }

  function projectRow(p, node, idx, pathForCrumb) {
    var tr = el("tr");
    var tdName = el("td");
    tdName.appendChild(el("span", { class: "pname" })).appendChild(el("a", { href: p.url, target: "_blank", rel: "noopener", text: p.name }));
    if (p.description) tdName.appendChild(el("div", { class: "desc", text: p.description }));
    if (pathForCrumb) tdName.appendChild(el("div", { class: "hit-path", text: "📂 " + pathForCrumb.join(" / ") }));
    tr.appendChild(tdName);
    tr.appendChild(langCell(p.language));

    var tdStar = el("td", { class: "stars" });
    tdStar.setAttribute("data-url", p.url);
    tdStar.textContent = fmtStars(starOf(p));
    tr.appendChild(tdStar);

    var tdOps = el("td", { class: "row-ops" });
    if (state.canEdit) {
      var sel = el("select", { class: "move-sel", onchange: (function (n, i) { return function (e) { if (e.target.value) moveProject(n, i, e.target.value); e.target.value = ""; }; })(node, idx) });
      sel.appendChild(el("option", { value: "", text: "移到…" }));
      getAllPaths(state.db, "").forEach(function (pth) { sel.appendChild(el("option", { value: pth, text: pth })); });
      tdOps.appendChild(sel);
      tdOps.appendChild(el("a", { class: "danger", text: "删除", onclick: (function (n, u) { return function () { deleteProject(n, u); }; })(node, p.url) }));
    }
    tr.appendChild(tdOps);
    return tr;
  }

  var TABLE_HEAD = ["项目", "语言", "★", ""];

  function buildTable(rows) {
    var table = el("table", { class: "projects" });
    var thead = el("thead"), trh = el("tr");
    TABLE_HEAD.forEach(function (c) { trh.appendChild(el("th", { text: c })); });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (r) { tbody.appendChild(r); });
    table.appendChild(tbody);
    return table;
  }

  function searchHits(q) {
    var hits = [];
    (function walk(nodes, path) {
      (nodes || []).forEach(function (n) {
        var p = path.concat([n.name]);
        (n.projects || []).forEach(function (proj, idx) {
          var hay = ((proj.name || "") + " " + (proj.description || "") + " " + (proj.language || "")).toLowerCase();
          if (hay.indexOf(q) !== -1) hits.push({ proj: proj, node: n, idx: idx, path: p });
        });
        walk(n.children, p);
      });
    })(state.db, []);
    return hits;
  }

  function renderPanel() {
    var panel = $("#panel");
    panel.textContent = "";

    // 全局搜索模式
    if (state.query) {
      var q = state.query.toLowerCase();
      var hits = searchHits(q);
      panel.appendChild(el("div", { class: "panel-title" })).appendChild(el("h2", { text: "搜索：" + state.query }));
      panel.appendChild(el("div", { class: "panel-sub", text: hits.length + " 个结果" }));
      if (!hits.length) {
        panel.appendChild(el("div", { class: "empty" })).innerHTML = '<div class="big">🔍</div>没有找到匹配的项目';
        return;
      }
      panel.appendChild(buildTable(hits.slice(0, 50).map(function (h) {
        return projectRow(h.proj, h.node, h.idx, h.path);
      })));
      lazyFetchStars();
      return;
    }

    if (!state.selectedPath.length) {
      var total = countProjects({ projects: [], children: state.db });
      var empty = el("div", { class: "empty" });
      empty.innerHTML = '<div class="big">👈</div>从左侧选择分类查看项目';
      panel.appendChild(empty);
      panel.appendChild(el("div", { class: "panel-sub", style: "text-align:center", text: "共收录 " + total + " 个项目 · " + getAllPaths(state.db, "").length + " 个分类" }));
      return;
    }

    var node = getNodeByPath(state.selectedPath);
    if (!node) { state.selectedPath = []; return renderPanel(); }

    var title = el("div", { class: "panel-title" });
    title.appendChild(el("h2", { text: state.selectedPath[state.selectedPath.length - 1] }));
    title.appendChild(el("span", { class: "crumb", text: state.selectedPath.join(" / ") }));
    panel.appendChild(title);
    var projects = node.projects || [];
    panel.appendChild(el("div", { class: "panel-sub", text: projects.length + " 个项目" }));

    if (!projects.length) {
      panel.appendChild(el("div", { class: "empty" })).innerHTML = '<div class="big">📭</div>该分类暂无项目';
    } else {
      panel.appendChild(buildTable(projects.map(function (p, idx) {
        return projectRow(p, node, idx, null);
      })));
    }
    lazyFetchStars();
  }

  function renderPreviewTab() {
    var md = renderREADME(state.db);
    var out = $("#previewView");
    out.textContent = "";
    if (window.marked) {
      var div = el("div", { class: "md-body" });
      try { div.innerHTML = window.marked.parse(md); out.appendChild(div); return; } catch (e) { /* fallback */ }
    }
    out.appendChild(el("pre", { text: md }));
  }

  // ---------- 初始化 ----------
  function bindUI() {
    $("#loginBtn").addEventListener("click", showTokenDialog);
    $("#logoutLink").addEventListener("click", logout);
    $("#saveBtn").addEventListener("click", saveAll);
    $("#fetchMetaBtn").addEventListener("click", fetchMeta);
    $("#addProjectBtn").addEventListener("click", addProject);
    $("#tokenSave").addEventListener("click", loginWithToken);
    $("#tokenCancel").addEventListener("click", function () { hideTokenDialog(); });
    $("#tokenInput").addEventListener("keydown", function (e) { if (e.key === "Enter") loginWithToken(); });
    $("#inUrl").addEventListener("keydown", function (e) { if (e.key === "Enter") fetchMeta(); });
    $("#searchInput").addEventListener("input", function (e) {
      state.query = e.target.value.trim();
      renderPanel();
    });

    document.querySelectorAll(".tab").forEach(function (t) {
      t.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        var view = t.dataset.view;
        $("#browseView").hidden = view !== "browse";
        $("#previewView").hidden = view !== "preview";
        if (view === "preview") renderPreviewTab();
      });
    });
  }

  function fillCategorySelect() {
    var sel = $("#selCategory");
    sel.textContent = "";
    getAllPaths(state.db, "").forEach(function (p) {
      sel.appendChild(el("option", { value: p, text: p }));
    });
  }

  function init() {
    bindUI();
    fetchFirst(["stars.json", RAW + "/docs/stars.json"]).then(function (r) { return r.json(); })
      .then(function (s) { state.stars = (s && s.stars) || {}; })
      .catch(function () {})
      .finally(function () {
        loadDB()
          .then(fillCategorySelect)
          .then(restoreSession)
          .then(function () { renderTree(); renderPanel(); updateChrome(); })
          .catch(function (e) { toast("数据加载失败：" + e.message, true); });
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
