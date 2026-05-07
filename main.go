package main

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"os"
	"regexp"
	"strings"
	"text/template"
)

// ======== 纯净版数据结构 (去除 Stars) ========
type Project struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Language    string `json:"language"`
}

type CategoryNode struct {
	Name     string          `json:"name"`
	Children []*CategoryNode `json:"children,omitempty"`
	Projects []Project       `json:"projects,omitempty"`
}

const issueTemplateHeader = `name: ➕ 新增开源项目
description: 提交一个新的优秀开源项目到收录录
title: "[Add]: 自动解析新项目"
labels: ["auto-add"]
body:
  - type: input
    id: repo_url
    attributes:
      label: GitHub 仓库地址
    validations:
      required: true
  - type: dropdown
    id: category
    attributes:
      label: 归属分类 (选择已有)
      options:
`

const issueTemplateFooter = `  - type: input
    id: new_category
    attributes:
      label: 💡 或创建新分类 (支持多级，用 / 分隔)
      description: 例如 "后端 / Go / Web框架"
`

func main() {
	actionType := os.Getenv("ACTION_TYPE")
	issueBody := os.Getenv("ISSUE_BODY")
	githubToken := os.Getenv("GITHUB_TOKEN")
	if actionType == "" || issueBody == "" {
		os.Exit(0)
	}

	dbPath := "data.json"
	var db []*CategoryNode
	raw, _ := os.ReadFile(dbPath)
	json.Unmarshal(raw, &db)

	repoURL := extractField(issueBody, "GitHub 仓库地址")

	if actionType == "add" {
		pathStr := extractField(issueBody, "💡 或创建新分类 (支持多级，用 / 分隔)")

		if pathStr == "" || pathStr == "_No response_" || pathStr == "None" {
			pathStr = extractField(issueBody, "归属分类 (选择已有)")
		}

		if pathStr == "" || pathStr == "_No response_" || pathStr == "None" {
			fmt.Println("未提取到有效分类，拦截执行。")
			os.Exit(1)
		}

		pathParts := splitPath(pathStr)
		targetNode := findOrCreateNode(&db, pathParts)

		owner, repo := parseGitHubURL(repoURL)
		p, err := fetchRepoMeta(owner, repo, githubToken)
		if err == nil {
			// 新项目置顶：插入到数组最前面
			targetNode.Projects = append([]Project{*p}, targetNode.Projects...)
		} else {
			fmt.Println("获取仓库元数据失败:", err)
			os.Exit(1)
		}
	} else if actionType == "delete" {
		recursiveDelete(db, repoURL)
	}

	saveData(dbPath, db)
	renderView("README.md.tmpl", "README.md", db)
	updateIssueTemplate(".github/ISSUE_TEMPLATE/1_add_project.yml", db)
}

// ======== 核心递归逻辑 ========

func findOrCreateNode(nodes *[]*CategoryNode, path []string) *CategoryNode {
	if len(path) == 0 {
		return nil
	}
	curr := path[0]
	var found *CategoryNode
	for _, n := range *nodes {
		if n.Name == curr {
			found = n
			break
		}
	}
	if found == nil {
		found = &CategoryNode{Name: curr}
		*nodes = append(*nodes, found)
	}
	if len(path) == 1 {
		return found
	}
	return findOrCreateNode(&found.Children, path[1:])
}

func recursiveDelete(nodes []*CategoryNode, url string) {
	for _, n := range nodes {
		var active []Project
		for _, p := range n.Projects {
			if !strings.EqualFold(p.URL, url) {
				active = append(active, p)
			}
		}
		n.Projects = active
		recursiveDelete(n.Children, url)
	}
}

func getAllPaths(nodes []*CategoryNode, prefix string) []string {
	var paths []string
	for _, n := range nodes {
		curr := n.Name
		if prefix != "" {
			curr = prefix + " / " + n.Name
		}
		paths = append(paths, curr)
		paths = append(paths, getAllPaths(n.Children, curr)...)
	}
	return paths
}

// ======== 辅助工具 ========

func extractField(body, fieldName string) string {
	// 自动转义括号等特殊字符，修复正则提取失败的问题
	safeFieldName := regexp.QuoteMeta(fieldName)
	re := regexp.MustCompile("(?m)^### " + safeFieldName + `\s*\n+([^\n]+)`)
	m := re.FindStringSubmatch(body)
	if len(m) > 1 {
		return strings.TrimSpace(m[1])
	}
	return ""
}

func splitPath(p string) []string {
	parts := strings.Split(p, "/")
	var res []string
	for _, s := range parts {
		s = strings.TrimSpace(s)
		if s != "" {
			res = append(res, s)
		}
	}
	return res
}

func parseGitHubURL(u string) (string, string) {
	re := regexp.MustCompile(`github\.com/([^/]+)/([^/]+)`)
	m := re.FindStringSubmatch(u)
	if len(m) < 3 {
		return "", ""
	}
	return m[1], strings.TrimSuffix(m[2], ".git")
}

func fetchRepoMeta(owner, repo, token string) (*Project, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repo)
	req, _ := http.NewRequest("GET", url, nil)
	if token != "" {
		req.Header.Set("Authorization", "token "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// API 解析结构中彻底移除 Stars 字段
	var d struct {
		Name string `json:"name"`
		Desc string `json:"description"`
		Lang string `json:"language"`
		URL  string `json:"html_url"`
	}
	json.NewDecoder(resp.Body).Decode(&d)
	return &Project{Name: d.Name, URL: d.URL, Description: html.EscapeString(d.Desc), Language: d.Lang}, nil
}

func saveData(path string, db []*CategoryNode) {
	b, _ := json.MarshalIndent(db, "", "  ")
	os.WriteFile(path, b, 0644)
}

func updateIssueTemplate(path string, db []*CategoryNode) {
	paths := getAllPaths(db, "")
	content := issueTemplateHeader
	for _, p := range paths {
		content += fmt.Sprintf("        - \"%s\"\n", p)
	}
	content += issueTemplateFooter
	os.WriteFile(path, []byte(content), 0644)
}

func renderView(tmplPath, outPath string, db []*CategoryNode) {
	funcMap := template.FuncMap{
		"add":    func(a, b int) int { return a + b },
		"repeat": func(s string, n int) string { return strings.Repeat(s, n) },
		"dict": func(values ...interface{}) (map[string]interface{}, error) {
			if len(values)%2 != 0 {
				return nil, fmt.Errorf("invalid dict")
			}
			dict := make(map[string]interface{}, len(values)/2)
			for i := 0; i < len(values); i += 2 {
				dict[values[i].(string)] = values[i+1]
			}
			return dict, nil
		},
		"dynamicStar": func(u string) string {
			owner, repo := parseGitHubURL(u)
			if owner != "" && repo != "" {
				return fmt.Sprintf("![Star](https://img.shields.io/github/stars/%s/%s.svg?style=social&label=Star)", owner, repo)
			}
			return "N/A"
		},
	}
	t, _ := template.New("README.md.tmpl").Funcs(funcMap).ParseFiles(tmplPath)
	f, _ := os.Create(outPath)
	defer f.Close()
	t.Execute(f, db)
}
