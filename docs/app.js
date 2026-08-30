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
        else if (k === "style") node.style.cssText = attrs[k];
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

  // ---------- SVG 图标（线性风格，继承 currentColor） ----------
  var ICONS = {
    chevron: '<path d="M9 18l6-6-6-6"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    folderOpen: '<path fill="currentColor" stroke="none" opacity=".4" d="M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.4.6L12 6h7a2 2 0 0 1 2 2v1H5.4a2 2 0 0 0-1.95 1.52L2.2 15.9A1 1 0 0 1 2 16.2V6z"/><path fill="currentColor" stroke="none" d="M4.6 10.5h16a1 1 0 0 1 .97 1.25l-1.47 5.9A2 2 0 0 1 18.16 19H5.2a2 2 0 0 1-1.95-2.46l1.38-5.55a1 1 0 0 1 .97-.75z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2.6l2.9 5.87 6.48.94-4.69 4.57 1.11 6.45L12 17.4l-5.8 3.03 1.11-6.45-4.69-4.57 6.48-.94z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    key: '<path d="M21 2l-5 5m-2.5 2.5a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L16 7"/><path d="M16 7l3 3 3-3-3-3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    layers: '<path d="M12 2l10 5.5-10 5.5L2 7.5z"/><path d="M2 13l10 5.5L22 13"/>',
    folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M12 11v6M9 14h6"/>'
  };
  function icon(name, cls) {
    return '<svg class="icn ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  // ---------- 文本转义与搜索高亮 ----------
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function highlight(text, q) {
    var esc = escapeHtml(text);
    if (!q) return esc;
    var safe = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return esc.replace(new RegExp("(" + safe + ")", "gi"), "<mark>$1</mark>");
    } catch (e) { return esc; }
  }

  // ---------- 主题 ----------
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = $("#themeBtn");
    if (btn) {
      btn.innerHTML = icon(t === "dark" ? "sun" : "moon");
      btn.title = t === "dark" ? "切换到亮色模式" : "切换到暗色模式";
    }
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("asuna_theme", cur);
    applyTheme(cur);
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
    query: "",
    sort: localStorage.getItem("asuna_sort") || "default",
    expanded: JSON.parse(localStorage.getItem("asuna_expanded") || "{}"),
    stars: {},
    starCache: JSON.parse(localStorage.getItem("asuna_starcache") || "{}"),
    starFetchBudget: 30,
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
  function renderSkeleton() {
    var grid = el("div", { class: "skel-grid" });
    for (var i = 0; i < 6; i++) grid.appendChild(el("div", { class: "skel" }));
    $("#panel").textContent = "";
    $("#panel").appendChild(grid);
  }

  function loadDB() {
    renderSkeleton();
    return fetchFirst([RAW + "/data.json"]).then(function (r) { return r.json(); }).then(function (db) {
      state.db = db;
      state.dirty = false;
      // 默认展开所有根分类
      state.db.forEach(function (n) { state.expanded[n.name] = true; });
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
      updateChrome(); renderTree(); renderPanel();
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
    updateChrome(); renderTree(); renderPanel();
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

  // ---------- 树操作 ----------
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

  // ---------- 添加项目（弹窗流程）----------
  var fetchedMeta = null;

  function openAddDialog() {
    fetchedMeta = null;
    $("#inUrl").value = "";
    $("#addStep2").hidden = true;
    $("#addBox").style.display = "flex";
    $("#inUrl").focus();
  }
  function closeAddDialog() { $("#addBox").style.display = "none"; }

  function fetchMeta() {
    var raw = $("#inUrl").value;
    var parts = REPO_URL_RE.exec(raw.trim());
    if (!parts) { toast("URL 无效：需为 github.com/owner/repo 形式", true); return; }
    $("#fetchMetaBtn").disabled = true;
    $("#fetchMetaBtn").textContent = "获取中";
    gh("/repos/" + parts[1] + "/" + parts[2]).then(function (d) {
      fetchedMeta = d;
      var prev = $("#metaPreview");
      prev.textContent = "";
      prev.appendChild(el("img", { src: "https://github.com/" + parts[1] + ".png?size=80", alt: "" }));
      var info = el("div", { style: "flex:1;min-width:0" });
      info.appendChild(el("div", { class: "mp-name", text: d.full_name }));
      if (d.description) info.appendChild(el("div", { class: "mp-desc", text: d.description }));
      var meta = el("div", { class: "mp-meta" });
      meta.appendChild(el("span", { text: "★ " + d.stargazers_count }));
      if (d.language) {
        var lg = el("span", { class: "lang" });
        lg.appendChild(el("i", { class: "lang-dot" })).style.background = LANG_COLORS[d.language] || "#8b949e";
        lg.appendChild(document.createTextNode(d.language));
        meta.appendChild(lg);
      }
      info.appendChild(meta);
      prev.appendChild(info);
      $("#addStep2").hidden = false;
    }).catch(function (e) {
      fetchedMeta = null;
      toast(e.status === 403 ? "API 限流，稍后再试" : "获取失败：仓库不存在或不可访问", true);
    }).finally(function () {
      $("#fetchMetaBtn").disabled = false;
      $("#fetchMetaBtn").textContent = "获取";
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
    if (!fetchedMeta) return;
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
    state.expanded[pathStr] = true;
    renderTree(); renderPanel();
    closeAddDialog();
    toast("已暂存：「" + fetchedMeta.name + "」→ " + pathStr);
  }

  function deleteProject(node, url) {
    if (!confirm("确认删除该项目？保存后生效。")) return;
    node.projects = (node.projects || []).filter(function (p) { return p.url !== url; });
    pruneEmpty(state.db);
    markDirty();
    renderTree(); renderPanel();
  }

  function moveProjectByUrl(url, newPath) {
    var found = null;
    (function walk(nodes) {
      (nodes || []).forEach(function (n) {
        if (found) return;
        var idx = (n.projects || []).findIndex(function (p) { return p.url === url; });
        if (idx >= 0) { found = { node: n, idx: idx }; return; }
        walk(n.children);
      });
    })(state.db);
    if (!found) return;
    if (getNodeByPath(newPath.split(" / ")) === found.node) {
      toast("已在该分类中", true);
      return;
    }
    var p = found.node.projects.splice(found.idx, 1)[0];
    var target = ensureNode(newPath.split(" / "));
    target.projects = target.projects || [];
    target.projects.push(p);
    state.expanded[newPath] = true;
    pruneEmpty(state.db);
    markDirty();
    renderTree(); renderPanel();
    toast("已移动「" + p.name + "」→ " + newPath);
  }

  function addCategory(parentPath) {
    var name = prompt(parentPath && parentPath.length ? "子分类名称：" : "根分类名称：");
    if (name === null) return;
    var err = sanitizeSegment(name);
    if (err) { toast(err, true); return; }
    ensureNode((parentPath || []).concat([name]));
    markDirty();
    state.selectedPath = (parentPath || []).concat([name]);
    state.expanded[(parentPath || []).join(" / ")] = true;
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

  // ---------- Star ----------
  function starOf(p) {
    if (p.stars != null) return p.stars;
    var snap = state.stars[p.url];
    if (snap != null) return snap;
    var c = state.starCache[p.url];
    if (c && Date.now() - c.t < 86400e3) return c.s;
    return null;
  }

  function fmtStars(n) {
    if (n == null) return "…";
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function lazyFetchStars() {
    var missing = [];
    document.querySelectorAll(".card-meta .star[data-url]").forEach(function (sp) {
      if (sp.textContent.trim() === "…") missing.push(sp);
    });
    missing = missing.slice(0, 10);
    function next() {
      if (!missing.length || state.starFetchBudget <= 0) return;
      var sp = missing.shift();
      var url = sp.getAttribute("data-url");
      var m = REPO_URL_RE.exec(url);
      if (!m) { sp.innerHTML = icon("star") + " -"; return; }
      state.starFetchBudget--;
      gh("/repos/" + m[1] + "/" + m[2]).then(function (d) {
        state.starCache[url] = { s: d.stargazers_count, t: Date.now() };
        localStorage.setItem("asuna_starcache", JSON.stringify(state.starCache));
        sp.innerHTML = icon("star") + " " + fmtStars(d.stargazers_count);
      }).catch(function () { sp.innerHTML = icon("star") + " -"; })
        .finally(next);
    }
    next();
  }

  // ---------- 渲染 ----------
  function updateChrome() {
    var loginBtn = $("#loginBtn"), userChip = $("#userChip"), saveBtn = $("#saveBtn");
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    if (state.user) {
      loginBtn.hidden = true;
      userChip.hidden = false;
      $("#userName").textContent = state.user.login + (state.canEdit ? " · 编辑者" : " · 只读");
      if (state.user.avatar_url) $("#userAvatar").src = state.user.avatar_url + "&s=48";
    } else {
      loginBtn.hidden = false;
      loginBtn.innerHTML = icon("key") + (state.token ? " 重新登录" : " 登录编辑");
      userChip.hidden = true;
    }
    saveBtn.hidden = !(state.canEdit && state.dirty);
    saveBtn.innerHTML = icon("save") + " 保存更改";
  }

  function countProjects(n) {
    var c = (n.projects || []).length;
    (n.children || []).forEach(function (ch) { c += countProjects(ch); });
    return c;
  }

  function totalProjects() {
    return state.db.reduce(function (s, n) { return s + countProjects(n); }, 0);
  }

  function renderTree() {
    var box = $("#treeScroll");
    box.textContent = "";
    $("#treeTotal").textContent = totalProjects() + " 项目";

    function drawInto(container, nodes, path, level) {
      (nodes || []).forEach(function (n) {
        var p = path.concat([n.name]);
        var key = p.join(" / ");
        var kids = n.children || [];
        var isOpen = !!state.expanded[key];
        var active = p.join("/") === state.selectedPath.join("/");

        var row = el("div", {
          class: "tree-row" + (active ? " active" : ""),
          onclick: function () {
            state.selectedPath = p;
            state.query = "";
            $("#searchInput").value = "";
            if (kids.length) state.expanded[key] = true;
            renderTree(); renderPanel();
          },
          ondragover: state.canEdit ? function (e) { e.preventDefault(); row.classList.add("drop-target"); } : null,
          ondragleave: function () { row.classList.remove("drop-target"); },
          ondrop: state.canEdit ? function (e) {
            e.preventDefault();
            row.classList.remove("drop-target");
            var url = e.dataTransfer.getData("text/plain");
            if (url) moveProjectByUrl(url, key);
          } : null,
        });

        row.appendChild(el("span", {
          class: "chev" + (isOpen ? " open" : "") + (kids.length ? "" : " hidden-vis"),
          html: icon("chevron"),
          onclick: (function (k) {
            return function (e) {
              e.stopPropagation();
              state.expanded[k] = !state.expanded[k];
              localStorage.setItem("asuna_expanded", JSON.stringify(state.expanded));
              renderTree();
            };
          })(key),
        }));
        row.appendChild(el("span", { class: "ficon", html: icon(isOpen && kids.length ? "folderOpen" : "folder") }));
        row.appendChild(el("span", { class: "tree-name", text: n.name }));
        row.appendChild(el("span", { class: "count", text: String(countProjects(n)) }));

        if (state.canEdit) {
          var ops = el("span", { class: "ops" });
          ops.appendChild(el("a", { title: "添加子分类", html: icon("folderPlus"), onclick: (function (pp) { return function (e) { e.stopPropagation(); addCategory(pp); }; })(p) }));
          if (kids.length === 0 && (n.projects || []).length === 0) {
            ops.appendChild(el("a", { class: "del", title: "删除空分类", html: icon("trash"), onclick: (function (pp) { return function (e) { e.stopPropagation(); deleteCategory(pp); }; })(p) }));
          }
          row.appendChild(ops);
        }
        container.appendChild(row);

        if (kids.length && isOpen) {
          var wrap = el("div", { class: "tree-children" });
          container.appendChild(wrap);
          drawInto(wrap, kids, p, level + 1);
        }
      });
    }
    drawInto(box, state.db, [], 0);

    if (state.canEdit) {
      box.appendChild(el("button", { class: "btn ghost sm block", html: icon("plus") + " 新增根分类", onclick: function () { addCategory([]); } }));
    }
  }

  function sorted(list) {
    var arr = list.slice();
    if (state.sort === "stars") arr.sort(function (a, b) { return (starOf(b) || 0) - (starOf(a) || 0); });
    else if (state.sort === "name") arr.sort(function (a, b) { return (a.name || "").localeCompare(b.name || ""); });
    return arr;
  }

  function projectCard(p, pathForCrumb, hl) {
    var owner = REPO_URL_RE.exec(p.url);
    var card = el("div", { class: "pcard", style: "animation-delay:" + Math.min((p._i || 0) * 30, 300) + "ms" });
    card.onclick = function () { window.open(p.url, "_blank", "noopener"); };

    if (state.canEdit) {
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", p.url);
        e.dataTransfer.effectAllowed = "move";
      });
      var acts = el("div", { class: "card-actions" });
      acts.appendChild(el("button", {
        class: "icon-btn del", title: "删除", html: icon("trash"),
        onclick: function (e) { e.stopPropagation(); deleteProjectByCard(card, p); },
      }));
      card.appendChild(acts);
    }

    var top = el("div", { class: "pcard-top" });
    if (owner) top.appendChild(el("img", { src: "https://github.com/" + owner[1] + ".png?size=64", alt: "", loading: "lazy" }));
    else top.appendChild(el("img", { src: "https://github.com/github.png?size=64", alt: "" }));
    var nameWrap = el("b");
    var nameLink = el("a", { href: p.url, target: "_blank", rel: "noopener", onclick: function (e) { e.stopPropagation(); } });
    if (hl) nameLink.innerHTML = highlight(p.name, hl);
    else nameLink.textContent = p.name;
    nameWrap.appendChild(nameLink);
    top.appendChild(nameWrap);
    top.appendChild(el("span", { class: "card-go", html: icon("arrow") }));
    card.appendChild(top);

    if (p.description) {
      var desc = el("div", { class: "card-desc" });
      if (hl) desc.innerHTML = highlight(p.description, hl);
      else desc.textContent = p.description;
      card.appendChild(desc);
    }

    var meta = el("div", { class: "card-meta" });
    if (p.language) {
      var lg = el("span", { class: "lang" });
      lg.appendChild(el("i", { class: "lang-dot" })).style.background = LANG_COLORS[p.language] || "#8b949e";
      lg.appendChild(document.createTextNode(p.language));
      meta.appendChild(lg);
    }
    var star = el("span", { class: "star" });
    star.setAttribute("data-url", p.url);
    star.innerHTML = icon("star") + " " + escapeHtml(fmtStars(starOf(p)));
    meta.appendChild(star);
    card.appendChild(meta);

    if (pathForCrumb) card.appendChild(el("span", { class: "hit-path", text: pathForCrumb.join(" / ") }));
    return card;
  }

  function deleteProjectByCard(card, p) {
    var found = null;
    (function walk(nodes) {
      (nodes || []).forEach(function (n) {
        if (found) return;
        var idx = (n.projects || []).findIndex(function (x) { return x.url === p.url; });
        if (idx >= 0) { found = { node: n, idx: idx }; return; }
        walk(n.children);
      });
    })(state.db);
    if (found) deleteProject(found.node, p.url);
  }

  function searchHits(q) {
    var hits = [];
    (function walk(nodes, path) {
      (nodes || []).forEach(function (n) {
        var p = path.concat([n.name]);
        (n.projects || []).forEach(function (proj) {
          var hay = ((proj.name || "") + " " + (proj.description || "") + " " + (proj.language || "")).toLowerCase();
          if (hay.indexOf(q) !== -1) hits.push({ proj: proj, path: p });
        });
        walk(n.children, p);
      });
    })(state.db, []);
    return hits;
  }

  function cardsGrid(items, withPath, hl) {
    var grid = el("div", { class: "cards" });
    items.forEach(function (it, i) {
      it._i = i;
      grid.appendChild(projectCard(it.proj || it, withPath ? it.path : null, hl));
    });
    return grid;
  }

  function sortSelect() {
    var sel = el("select", { onchange: function (e) { state.sort = e.target.value; localStorage.setItem("asuna_sort", e.target.value); renderPanel(); } });
    [["default", "默认排序"], ["stars", "按 Star"], ["name", "按名称"]].forEach(function (o) {
      var opt = el("option", { value: o[0], text: o[1] });
      if (state.sort === o[0]) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  function renderPanel() {
    var panel = $("#panel");
    panel.textContent = "";

    // 搜索模式
    if (state.query) {
      var hits = searchHits(state.query.toLowerCase());
      var sc = el("div", { class: "panel-card" });
      var head = el("div", { class: "panel-head" });
      var crumbs = el("div", { class: "crumbs" });
      crumbs.appendChild(el("span", { class: "head-icn", html: icon("search") }));
      crumbs.appendChild(el("span", { class: "seg", text: "搜索：" + state.query }));
      head.appendChild(crumbs);
      sc.appendChild(head);
      sc.appendChild(el("div", { class: "panel-sub" })).innerHTML = "<b>" + hits.length + "</b> 个结果";
      if (!hits.length) {
        sc.appendChild(el("div", { class: "empty" })).innerHTML = '<div class="big">🔍</div><p>没有找到匹配的项目</p>';
        panel.appendChild(sc);
        return;
      }
      sc.appendChild(cardsGrid(hits.slice(0, 60), true, state.query));
      panel.appendChild(sc);
      lazyFetchStars();
      return;
    }

    // 未选择分类：全局概览
    if (!state.selectedPath.length) {
      var all = [];
      (function walk(nodes, path) {
        (nodes || []).forEach(function (n) {
          var p = path.concat([n.name]);
          (n.projects || []).forEach(function (proj) { all.push({ proj: proj, path: p }); });
          walk(n.children, p);
        });
      })(state.db, []);

      var ov = el("div", { class: "panel-card" });
      var ohead = el("div", { class: "panel-head" });
      var ocrumbs = el("div", { class: "crumbs" });
      ocrumbs.appendChild(el("span", { class: "head-icn", html: icon("layers") }));
      ocrumbs.appendChild(el("span", { class: "seg", text: "全部项目" }));
      ohead.appendChild(ocrumbs);
      var tools0 = el("div", { class: "panel-tools" });
      if (all.length > 1) tools0.appendChild(sortSelect());
      if (state.canEdit) tools0.appendChild(el("button", { class: "btn accent sm", html: icon("plus") + " 添加项目", onclick: openAddDialog }));
      if (tools0.childNodes.length) ohead.appendChild(tools0);
      ov.appendChild(ohead);
      ov.appendChild(el("div", { class: "panel-sub" })).innerHTML =
        "共 <b>" + all.length + "</b> 个项目 · <b>" + getAllPaths(state.db, "").length + "</b> 个分类 · 合计 <b>★ " + fmtStars(all.reduce(function (s, x) { return s + (starOf(x.proj) || 0); }, 0)) + "</b> stars";
      ov.appendChild(cardsGrid(sorted(all.map(function (x) { return x.proj; })).map(function (proj) {
        var hit = all.find(function (x) { return x.proj === proj; });
        return { proj: proj, path: hit.path };
      }), true));
      panel.appendChild(ov);
      lazyFetchStars();
      return;
    }

    // 普通分类视图
    var node = getNodeByPath(state.selectedPath);
    if (!node) { state.selectedPath = []; return renderPanel(); }

    var card = el("div", { class: "panel-card" });

    var head = el("div", { class: "panel-head" });
    var crumbs = el("div", { class: "crumbs" });
    crumbs.appendChild(el("span", { class: "head-icn", html: icon("folder") }));
    state.selectedPath.forEach(function (seg, i) {
      if (i > 0) crumbs.appendChild(el("span", { class: "sep", text: "/" }));
      crumbs.appendChild(el("span", {
        class: "seg",
        text: seg,
        onclick: (function (idx) { return function () { state.selectedPath = state.selectedPath.slice(0, idx + 1); renderTree(); renderPanel(); }; })(i),
      }));
    });
    head.appendChild(crumbs);

    var tools = el("div", { class: "panel-tools" });
    var projects = node.projects || [];
    // 父分类没有直接项目时，展示子分类下的项目，避免"0 个项目"死胡同
    var subtree = [];
    if (!projects.length) {
      (function walk(nodes, path) {
        (nodes || []).forEach(function (n) {
          var p = path.concat([n.name]);
          (n.projects || []).forEach(function (proj) { subtree.push({ proj: proj, path: p }); });
          walk(n.children, p);
        });
      })(node.children || [], []);
    }
    if (projects.length > 1 || subtree.length > 1) tools.appendChild(sortSelect());
    if (state.canEdit) {
      tools.appendChild(el("button", { class: "btn ghost sm", html: icon("folderPlus") + " 子分类", onclick: function () { addCategory(state.selectedPath); } }));
      tools.appendChild(el("button", { class: "btn accent sm", html: icon("plus") + " 添加项目", onclick: openAddDialog }));
    }
    head.appendChild(tools);
    card.appendChild(head);

    var totalStar = projects.reduce(function (s, p) { return s + (starOf(p) || 0); }, 0);
    if (projects.length) {
      card.appendChild(el("div", { class: "panel-sub" })).innerHTML =
        "<b>" + projects.length + "</b> 个项目" + (totalStar ? " · 合计 ★ " + fmtStars(totalStar) : "");
    } else if (subtree.length) {
      card.appendChild(el("div", { class: "panel-sub" })).innerHTML =
        "本层无直接项目 · 子分类共 <b>" + subtree.length + "</b> 个项目";
    } else {
      card.appendChild(el("div", { class: "panel-sub" })).innerHTML = "<b>0</b> 个项目";
    }

    if (projects.length) {
      card.appendChild(cardsGrid(sorted(projects)));
    } else if (subtree.length) {
      card.appendChild(cardsGrid(sorted(subtree.map(function (x) { return x.proj; })).map(function (proj) {
        var hit = subtree.find(function (x) { return x.proj === proj; });
        return { proj: proj, path: hit.path };
      }), true));
    } else {
      var empty = el("div", { class: "empty" });
      empty.innerHTML = '<div class="big">📭</div><p>该分类暂无项目</p>';
      if (state.canEdit) empty.appendChild(el("button", { class: "btn accent", html: icon("plus") + " 添加第一个项目", onclick: openAddDialog }));
      card.appendChild(empty);
    }
    panel.appendChild(card);
    lazyFetchStars();
  }

  // ---------- 初始化 ----------
  function bindUI() {
    $("#loginBtn").addEventListener("click", showTokenDialog);
    $("#logoutLink").addEventListener("click", logout);
    $("#saveBtn").addEventListener("click", saveAll);
    $("#themeBtn").addEventListener("click", toggleTheme);
    $("#fetchMetaBtn").addEventListener("click", fetchMeta);
    $("#addProjectBtn").addEventListener("click", addProject);
    $("#addCancel").addEventListener("click", closeAddDialog);
    $("#tokenSave").addEventListener("click", loginWithToken);
    $("#tokenCancel").addEventListener("click", function () { hideTokenDialog(); });
    $("#tokenInput").addEventListener("keydown", function (e) { if (e.key === "Enter") loginWithToken(); });
    $("#inUrl").addEventListener("keydown", function (e) { if (e.key === "Enter") fetchMeta(); });
    var searchWrap = $("#searchWrap");
    $("#searchInput").addEventListener("input", function (e) {
      state.query = e.target.value.trim();
      searchWrap.classList.toggle("has-value", !!e.target.value);
      renderPanel();
    });
    $("#searchClear").addEventListener("click", function () {
      $("#searchInput").value = "";
      state.query = "";
      searchWrap.classList.remove("has-value");
      renderPanel();
      $("#searchInput").focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        $("#searchInput").focus();
      }
      if (e.key === "Escape") {
        closeAddDialog(); hideTokenDialog();
        if (document.activeElement === $("#searchInput") && state.query) {
          $("#searchInput").value = "";
          state.query = "";
          searchWrap.classList.remove("has-value");
          renderPanel();
        }
      }
    });

    document.querySelectorAll(".overlay").forEach(function (ov) {
      ov.addEventListener("click", function (e) { if (e.target === ov) ov.style.display = "none"; });
    });
  }

  function fillCategorySelect() {
    var sel = $("#selCategory");
    sel.textContent = "";
    state.db.forEach(function (n) {
      var og = el("optgroup", { label: n.name });
      getAllPaths([n], "").forEach(function (p) {
        og.appendChild(el("option", { value: p, text: p }));
      });
      sel.appendChild(og);
    });
  }

  function init() {
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    bindUI();
    fetchFirst(["stars.json", RAW + "/docs/stars.json"]).then(function (r) { return r.json(); })
      .then(function (s) { state.stars = (s && s.stars) || {}; })
      .catch(function () {})
      .finally(function () {
        loadDB()
          .then(fillCategorySelect)
          .then(restoreSession)
          .then(function () { renderTree(); renderPanel(); updateChrome(); })
          .catch(function (e) {
            $("#panel").textContent = "";
            $("#panel").appendChild(el("div", { class: "panel-card" })).appendChild(
              el("div", { class: "empty" })).innerHTML = '<div class="big">⚠️</div><p>数据加载失败：' + e.message + "</p>";
          });
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
