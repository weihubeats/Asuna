// README 渲染逻辑的 JS 移植，仅用于页面实时预览。
// 唯一真源是 main.go 的 renderView；CI 每次推送会用 Go 重算并纠正漂移。

const README_HEADER = "# Asuna 开源项目精选\n\n> 自动化管理与聚合优质开源项目。提交 Issue 即可自动收录。\n";
const TABLE_HEAD = "| 项目名称 | 描述 | 语言 | ⭐️ Stars |\n| :--- | :--- | :--- | :--- |\n";

function parseOwnerRepo(u) {
  const m = /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.(?:git))?(?:[\/?#].*)?$/i.exec((u || "").trim());
  return m ? [m[1], m[2]] : null;
}

function dynamicStar(u) {
  const p = parseOwnerRepo(u);
  if (!p) return "N/A";
  return "![Star](https://img.shields.io/github/stars/" + p[0] + "/" + p[1] + ".svg?style=social&label=Star)";
}

function collapseBlankLines(s) {
  return s.replace(/\n{3,}/g, "\n\n");
}

function renderREADME(db) {
  let out = README_HEADER;
  const walk = (nodes, level) => {
    for (const n of nodes || []) {
      const projects = n.projects || [];
      const children = n.children || [];
      if (projects.length === 0 && children.length === 0) continue;
      out += "\n" + "#".repeat(level) + " " + n.name + "\n\n";
      if (projects.length > 0) {
        out += TABLE_HEAD;
        for (const p of projects) {
          out += "| [" + p.name + "](" + p.url + ") | " + (p.description || "") + " | " + (p.language || "") + " | " + dynamicStar(p.url) + " |\n";
        }
      }
      if (children.length > 0) {
        walk(children, level + 1);
      }
    }
  };
  walk(db, 2);
  out = collapseBlankLines(out);
  if (!out.endsWith("\n")) out += "\n";
  return out;
}
