# Asuna 开源项目精选

> 自动化管理与聚合优质开源项目 —— 提交 Issue 或在网页上直接编辑，数据存储于本仓库。

## 🌐 在线访问

**https://weihubeats.github.io/Asuna/**

- 匿名访客：浏览全部收录、全局搜索、查看 Star 数
- 协作者：粘贴 Token 登录后可直接在网页上增删项目、调整分类、拖拽移动

## ✨ 特性

- 🗂️ 树形多级分类，卡片式浏览，语言彩点 + Star 排序
- 🔍 全局搜索（`/` 快捷键聚焦）
- 🖱️ 拖拽移动项目到任意分类
- 💾 编辑结果直接提交到仓库（Contents API + SHA 乐观锁，防并发覆盖）
- 🤖 CI 自动维护 Issue 表单分类下拉与 Star 快照

## 📥 如何收录新项目

| 方式 | 适合人群 | 入口 |
| :--- | :--- | :--- |
| 网页编辑 | 协作者 | [在线控制台](https://weihubeats.github.io/Asuna/) → 登录编辑 |
| Issue 投稿 | 所有人 | [新建 Issue](https://github.com/weihubeats/Asuna/issues/new/choose)，机器人自动收录 |

## 🏗️ 架构

```
data.json          # 唯一数据源（分类树 + 项目元数据）
docs/              # GitHub Pages 静态管理台（纯前端，无后端）
main.go            # 引擎：Issue 解析、GitHub API 元数据抓取、表单生成
.github/workflows/
  asuna_sync.yml   # Issue 驱动自动收录/删除
  render.yml       # 表单同步 + 每日 Star 快照
```

## License

[MIT](LICENSE)
