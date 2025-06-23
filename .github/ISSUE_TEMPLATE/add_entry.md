name: Add New Entry
description: Add a new project to README
title: "[Add] "
labels: ["add-entry"]
body:
- type: markdown
  attributes:
  value: |
  **请按照以下格式填写**

      示例：
      ```
      Title: 消息中间件
      Repo: https://github.com/weihubeats/fluxcache
      Name: 多级缓存框架
      Label: java
      ```

- type: textarea
  id: entry-info
  attributes:
  label: 项目信息
  placeholder: |
  Title:
  Repo:
  Name:
  Label: