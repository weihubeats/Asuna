/* Asuna 管理台 —— 纯静态 SPA
 * 匿名可浏览；Device Flow 登录 + 仓库写权限者可编辑。
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
    selectedPath: [],   // 当前选中的分类路径
    stars: {},          // url -> star 数快照
  };

  var API = "https://api.github.com";
  var RAW = "https://raw.githubusercontent.com/" + CFG.OWNER + "/" + CFG.REPO + "/" + CFG.BRANCH;

  // 依次尝试多个地址取第一个成功的
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
    // 页面部署在 /docs 下，仓库根目录的 data.json 走 raw（自带 CORS）
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
    if (!state.canEdit) return;
    if (!state.dirty) return;
    $("#saveBtn").disabled = true;
    $("#saveBtn").textContent = "保存中…";
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
      renderTree(); renderPanel(); updateChrome();
    }).catch(function (e) {
      if (e.status === 409 || e.status === 422) {
        toast("⚠️ 数据已被他人更新，正在重新加载，请重做未保存的修改", true);
        loadDB().then(refreshSHA);
      } else if (e.status === 403) {
        toast("❌ 无推送权限", true);
      } else {
        toast("❌ 保存失败：" + e.message, true);
      }
    }).finally(function () {
      $("#saveBtn").disabled = false;
      updateChrome();
    });
  }

  // ---------- Device Flow 登录 ----------
  function deviceLogin() {
    if (!CFG.CLIENT_ID) {
      toast("未配置 CLIENT_ID（docs/config.js），仅可浏览", true);
      return;
    }
    fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CFG.CLIENT_ID, scope: "public_repo" }),
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        window.open("https://github.com/login/device", "_blank");
        showCodeDialog(d.user_code, d.verification_uri);
        pollToken(d.device_code, d.interval || 5);
      })
      .catch(function () { toast("登录请求失败", true); });
  }

  function showCodeDialog(code, uri) {
    var box = $("#codeBox");
    $("#codeVal").textContent = code;
    $("#codeLink").href = uri;
    box.style.display = "flex";
  }
  function hideCodeDialog() { $("#codeBox").style.display = "none"; }

  function pollToken(deviceCode, interval) {
    setTimeout(function () {
      fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: CFG.CLIENT_ID,
          device_code: deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      }).then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.access_token) {
            hideCodeDialog();
            state.token = d.access_token;
            localStorage.setItem("asuna_token", d.access_token);
            refreshIdentity().then(updateChrome);
            toast("登录成功");
          } else if (d.error === "authorization_pending") {
            pollToken(deviceCode, interval);
          } else if (d.error === "slow_down") {
            pollToken(deviceCode, interval + 5);
          } else {
            hideCodeDialog();
            toast("登录失败：" + (d.error_description || d.error), true);
          }
        });
    }, interval * 1000);
  }

  function logout() {
    state.token = "";
    state.user = null;
    state.canEdit = false;
    localStorage.removeItem("asuna_token");
    updateChrome();
    toast("已退出");
  }

  function refreshIdentity() {
    state.user = null;
    state.canEdit = false;
    if (!state.token) return Promise.resolve();
    return gh("/user").then(function (u) {
      state.user = u;
      return gh("/repos/" + CFG.OWNER + "/" + CFG.REPO + "/collaborators/" + u.login + "/permission");
    }).then(function (p) {
      state.canEdit = p.permission === "write" || p.permission === "admin";
    }).catch(function () { state.canEdit = false; });
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
    var canon = canonicalRepoURL(raw);
    if (!canon) { toast("URL 无效：需为 github.com/owner/repo 形式", true); return; }
    var parts = REPO_URL_RE.exec(raw.trim());
    $("#metaCard").hidden = false;
    $("#metaBody").textContent = "获取中…";
    gh("/repos/" + parts[1] + "/" + parts[2]).then(function (d) {
      fetchedMeta = d;
      $("#metaBody").textContent = "";
      $("#metaBody").appendChild(el("strong", { text: d.full_name }));
      $("#metaBody").appendChild(document.createTextNode(
        "  ★ " + d.stargazers_count + " · " + (d.language || "未知语言") +
        (d.description ? "\n" + d.description : "")));
      $("#metaBody").whiteSpace = "pre-wrap";
    }).catch(function (e) {
      fetchedMeta = null;
      $("#metaBody").textContent = "获取失败：" + e.message + "（仓库不存在或 API 限流）";
    });
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
    renderTree(); renderPanel();
    $("#metaCard").hidden = true;
    $("#inUrl").value = "";
    toast("已暂存：「" + fetchedMeta.name + "」，点击右上角「保存」生效");
  }

  function cleanDesc(desc) {
    if (!desc) return "";
    var ta = document.createElement("textarea");
    ta.innerHTML = desc;
    desc = ta.value;
    desc = desc.replace(/\r/g, "").replace(/\n/g, " ").replace(/\|/g, "\\|");
    return desc.trim();
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
    var parentNodes = path.length === 1 ? state.db : getNodeByPath(path.slice(0, -1)).children;
    parentNodes = parentNodes.filter(function (n) { return n.name !== path[path.length - 1]; });
    if (path.length === 1) state.db = parentNodes;
    markDirty();
    state.selectedPath = [];
    renderTree(); renderPanel();
  }

  // ---------- 渲染 ----------
  function updateChrome() {
    var loginBtn = $("#loginBtn"), userChip = $("#userChip"), saveBtn = $("#saveBtn");
    if (state.user) {
      loginBtn.hidden = true;
      userChip.hidden = false;
      $("#userName").textContent = state.user.login + (state.canEdit ? "（编辑者）" : "（只读）");
    } else {
      loginBtn.hidden = !!state.token; // token 失效时显示重新登录
      userChip.hidden = true;
      if (state.token) loginBtn.textContent = "重新登录";
    }
    saveBtn.hidden = !(state.canEdit && state.dirty);
    saveBtn.textContent = state.dirty ? "💾 保存全部更改" : "保存";
    $("#editorBar").hidden = !state.canEdit;
    $("#logoutLink").hidden = !state.user;
  }

  function renderTree() {
    var box = $("#tree");
    box.textContent = "";

    function draw(nodes, path, level) {
      (nodes || []).forEach(function (n) {
        var p = path.concat([n.name]);
        var count = countProjects(n);
        var row = el("div", {
          class: "tree-row lv" + level + (isActive(p) ? " active" : ""),
          onclick: (function (pp) { return function () { state.selectedPath = pp; renderTree(); renderPanel(); }; })(p),
        });
        row.appendChild(el("span", { class: "tree-name", text: n.name }));
        row.appendChild(el("span", { class: "count", text: String(count) }));

        if (state.canEdit) {
          var ops = el("span", { class: "ops" });
          ops.appendChild(el("a", { text: "+子类", title: "添加子分类", onclick: (function (pp) { return function (e) { e.stopPropagation(); addCategory(pp); }; })(p) }));
          if (count === 0 && (n.projects || []).length === 0) {
            ops.appendChild(el("a", { text: "删", title: "删除空分类", onclick: (function (pp) { return function (e) { e.stopPropagation(); deleteCategory(pp); }; })(p) }));
          }
          row.appendChild(ops);
        }
        box.appendChild(row);
        draw(n.children, p, Math.min(level + 1, 3));
      });
    }
    draw(state.db, [], 0);

    if (state.canEdit) {
      box.appendChild(el("button", { class: "btn ghost sm block", text: "+ 新增根分类", onclick: function () { addCategory([]); } }));
    }
  }

  function isActive(p) { return p.join("/") === state.selectedPath.join("/"); }

  function countProjects(n) {
    var c = (n.projects || []).length;
    (n.children || []).forEach(function (ch) { c += countProjects(ch); });
    return c;
  }

  function renderPanel() {
    var panel = $("#panel");
    panel.textContent = "";
    if (!state.selectedPath.length) {
      panel.appendChild(el("div", { class: "empty", text: "← 从左侧选择一个分类查看项目" }));
      return;
    }
    var node = getNodeByPath(state.selectedPath);
    if (!node) { state.selectedPath = []; return renderPanel(); }

    panel.appendChild(el("h2", { text: state.selectedPath.join(" / ") }));

    var projects = node.projects || [];
    if (!projects.length) {
      panel.appendChild(el("div", { class: "empty", text: "该分类暂无项目" }));
    } else {
      var table = el("table", { class: "projects" });
      table.appendChild(headRow(["项目", "语言", "★", "", ""]));
      projects.forEach(function (p, idx) {
        var tr = el("tr");
        var link = el("a", { href: p.url, target: "_blank", rel: "noopener", text: p.name });
        var tdName = el("td"); tdName.appendChild(link);
        if (p.description) tdName.appendChild(el("div", { class: "desc", text: p.description }));
        tr.appendChild(tdName);
        tr.appendChild(el("td", { class: "muted", text: p.language || "-" }));
        tr.appendChild(el("td", { class: "stars", text: fmtStars(p.stars != null ? p.stars : state.stars[p.url]) }));

        var tdOps = el("td", { class: "row-ops" });
        if (state.canEdit) {
          var sel = el("select", { class: "move-sel", onchange: (function (n, i) { return function (e) { if (e.target.value) moveProject(n, i, e.target.value); e.target.value = ""; }; })(node, idx) });
          sel.appendChild(el("option", { value: "", text: "移到…" }));
          getAllPaths(state.db, "").forEach(function (pth) { sel.appendChild(el("option", { value: pth, text: pth })); });
          tdOps.appendChild(sel);
          tdOps.appendChild(el("a", { class: "danger", text: "删除", onclick: (function (n, u) { return function () { deleteProject(n, u); }; })(node, p.url) }));
        }
        tr.appendChild(tdOps);
        table.appendChild(tr);
      });
      panel.appendChild(table);
    }
  }

  function headRow(cols) {
    var tr = el("tr");
    cols.forEach(function (c) { tr.appendChild(el("th", { text: c })); });
    return tr;
  }

  function fmtStars(n) {
    if (n == null) return "-";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function renderPreviewTab() {
    var md = renderREADME(state.db);
    var out = $("#previewOut");
    out.textContent = "";
    if (window.marked) {
      var div = el("div", { class: "md-body" });
      try { div.innerHTML = window.marked.parse(md); } catch (e) { /* fallback below */ div = null; }
      if (div) { out.appendChild(div); return; }
    }
    out.appendChild(el("pre", { text: md }));
  }

  // ---------- 初始化 ----------
  function bindUI() {
    $("#loginBtn").addEventListener("click", deviceLogin);
    $("#logoutLink").addEventListener("click", logout);
    $("#saveBtn").addEventListener("click", saveAll);
    $("#fetchMetaBtn").addEventListener("click", fetchMeta);
    $("#addProjectBtn").addEventListener("click", addProject);

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

    $("#codeCancel").addEventListener("click", function () {
      hideCodeDialog();
      toast("已取消登录");
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
          .then(function () { if (state.token) return refreshIdentity(); })
          .then(function () {
            renderTree(); renderPanel(); updateChrome();
          })
          .catch(function (e) { toast(e.message, true); });
      });
  }

  // 暴露给 index.html 内联调用
  window.__asuna = { hideCodeDialog: hideCodeDialog };

  document.addEventListener("DOMContentLoaded", init);
})();
