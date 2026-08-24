package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"text/template"
	"time"
)

type Project struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Language    string `json:"language"`
	Stars       int    `json:"stars,omitempty"`
}

type CategoryNode struct {
	Name     string          `json:"name"`
	Children []*CategoryNode `json:"children,omitempty"`
	Projects []Project       `json:"projects,omitempty"`
}

const (
	dbPath            = "data.json"
	readmePath        = "README.md"
	tmplPath          = "README.md.tmpl"
	issueFormPath     = ".github/ISSUE_TEMPLATE/1_add_project.yml"
	starsSnapshotPath = "docs/stars.json"

	// GitHub issue forms dropdown 选项上限
	maxDropdownLen = 50
)

// Issue 表单字段 label。必须与 .github/ISSUE_TEMPLATE 下模板保持逐字一致，勿单独修改。
const (
	fieldRepoURL     = "GitHub 仓库地址"
	fieldCategory    = "归属分类 (选择已有)"
	fieldNewCategory = "💡 或创建新分类 (支持多级，用 / 分隔)"
)

const issueTemplateHeaderFmt = `name: ➕ 新增开源项目
description: 提交一个新的优秀开源项目到收录录
title: "[Add]: 自动解析新项目"
labels: ["auto-add"]
body:
  - type: input
    id: repo_url
    attributes:
      label: %s
    validations:
      required: true
  - type: dropdown
    id: category
    attributes:
      label: %s
      options:
`

const issueTemplateFooterFmt = `  - type: input
    id: new_category
    attributes:
      label: %s
      description: 例如 "后端 / Go / Web框架"
`

var apiBaseURL = "https://api.github.com"

var httpClient = &http.Client{Timeout: 15 * time.Second}

func main() {
	// CI 渲染模式：push 后由 Action 重算 README / 表单，纠正页面端漂移
	if os.Getenv("ASUNA_RENDER") == "1" {
		renderAll()
		return
	}
	// stars 快照模式：定时刷新 data.json 中的 star 数并写 docs/stars.json
	if os.Getenv("ASUNA_STARS") == "1" {
		if err := updateStars(os.Getenv("GITHUB_TOKEN")); err != nil {
			fatal(err)
		}
		return
	}

	actionType := os.Getenv("ACTION_TYPE")
	issueBody := os.Getenv("ISSUE_BODY")
	githubToken := os.Getenv("GITHUB_TOKEN")
	if actionType == "" || issueBody == "" {
		os.Exit(0)
	}

	db, err := loadDB(dbPath)
	if err != nil {
		fatal(err)
	}

	repoURL := extractField(issueBody, fieldRepoURL)

	switch actionType {
	case "add":
		if err := handleAdd(&db, issueBody, repoURL, githubToken); err != nil {
			fatal(err)
		}
	case "delete":
		if err := handleDelete(db, repoURL); err != nil {
			fatal(err)
		}
	default:
		fatal(fmt.Sprintf("未知 ACTION_TYPE: %q", actionType))
	}

	pruneEmpty(&db)

	if err := saveData(dbPath, db); err != nil {
		fatal(err)
	}
	if err := renderView(tmplPath, readmePath, db); err != nil {
		fatal(err)
	}
	if err := updateIssueTemplate(issueFormPath, buildIssueForm(db)); err != nil {
		fatal(err)
	}
}

func fatal(v interface{}) {
	fmt.Fprintln(os.Stderr, "错误:", v)
	os.Exit(1)
}

// ======== CI 模式 ========

// renderAll 由 render workflow 在每次 push 后调用，保证 README 与表单始终由 Go 真源生成
func renderAll() {
	db, err := loadDB(dbPath)
	if err != nil {
		fatal(err)
	}
	pruneEmpty(&db)
	if err := saveData(dbPath, db); err != nil {
		fatal(err)
	}
	if err := renderView(tmplPath, readmePath, db); err != nil {
		fatal(err)
	}
	if err := updateIssueTemplate(issueFormPath, buildIssueForm(db)); err != nil {
		fatal(err)
	}
	fmt.Println("渲染完成：README.md + issue form")
}

// updateStars 刷新 data.json 内所有项目的 star 数，并写 docs/stars.json 快照供页面零成本读取
func updateStars(token string) error {
	db, err := loadDB(dbPath)
	if err != nil {
		return err
	}
	var updated int
	var walk func(nodes []*CategoryNode)
	walk = func(nodes []*CategoryNode) {
		for _, n := range nodes {
			for i := range n.Projects {
				p := &n.Projects[i]
				s, err := fetchStars(p.URL, token)
				if err != nil {
					fmt.Fprintf(os.Stderr, "跳过 %s: %v\n", p.URL, err)
					continue
				}
				p.Stars = s
				updated++
			}
			walk(n.Children)
		}
	}
	walk(db)

	if err := saveData(dbPath, db); err != nil {
		return err
	}

	snapshot := map[string]int{}
	for _, n := range db {
		collectStars(n, snapshot)
	}
	meta := struct {
		UpdatedAt string         `json:"updated_at"`
		Stars     map[string]int `json:"stars"`
	}{
		UpdatedAt: time.Now().UTC().Format(time.RFC3339),
		Stars:     snapshot,
	}
	b, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}
	b = append(b, '\n')
	if err := os.WriteFile(starsSnapshotPath, b, 0644); err != nil {
		return err
	}
	fmt.Printf("stars 快照完成：%d 个项目 → %s\n", updated, starsSnapshotPath)
	return nil
}

func collectStars(n *CategoryNode, out map[string]int) {
	for _, p := range n.Projects {
		out[p.URL] = p.Stars
	}
	for _, c := range n.Children {
		collectStars(c, out)
	}
}

func fetchStars(repoURL, token string) (int, error) {
	owner, repo, err := parseOwnerRepo(repoURL)
	if err != nil {
		return 0, err
	}
	url := fmt.Sprintf("%s/repos/%s/%s", apiBaseURL, owner, repo)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	if token != "" {
		req.Header.Set("Authorization", "token "+token)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("GitHub API 返回 %d", resp.StatusCode)
	}
	var d struct {
		Stars int `json:"stargazers_count"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&d); err != nil {
		return 0, err
	}
	return d.Stars, nil
}

// ======== 业务动作 ========

func handleAdd(db *[]*CategoryNode, issueBody, repoURL, token string) error {
	pathStr := normalizeInput(extractField(issueBody, fieldNewCategory))
	if pathStr == "" {
		pathStr = normalizeInput(extractField(issueBody, fieldCategory))
	}
	if pathStr == "" {
		return errors.New("未提取到有效分类，拦截执行")
	}

	pathParts, err := splitPath(pathStr)
	if err != nil {
		return err
	}

	owner, repo, err := parseOwnerRepo(repoURL)
	if err != nil {
		return fmt.Errorf("无法解析 GitHub 仓库地址 %q", normalizeInput(repoURL))
	}
	canonical := "https://github.com/" + owner + "/" + repo

	if containsProject(*db, canonical) {
		return fmt.Errorf("%s 已存在于收录中，请勿重复提交", canonical)
	}

	p, err := fetchRepoMeta(owner, repo, token)
	if err != nil {
		return err
	}

	targetNode := findOrCreateNode(db, pathParts)
	targetNode.Projects = append(targetNode.Projects, *p)
	sortProjects(targetNode.Projects)
	return nil
}

func handleDelete(db []*CategoryNode, repoURL string) error {
	u := normalizeInput(repoURL)
	if u == "" {
		return errors.New("未提取到仓库地址，拦截执行")
	}
	canonical, err := canonicalRepoURL(u)
	if err != nil {
		return fmt.Errorf("无法解析 GitHub 仓库地址 %q", u)
	}
	if !recursiveDelete(db, canonical) {
		return fmt.Errorf("未在收录中找到 %s，无需删除", canonical)
	}
	return nil
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

func recursiveDelete(nodes []*CategoryNode, url string) bool {
	found := false
	for _, n := range nodes {
		var active []Project
		for _, p := range n.Projects {
			if strings.EqualFold(p.URL, url) {
				found = true
				continue
			}
			active = append(active, p)
		}
		n.Projects = active
		if recursiveDelete(n.Children, url) {
			found = true
		}
	}
	return found
}

func containsProject(nodes []*CategoryNode, url string) bool {
	for _, n := range nodes {
		for _, p := range n.Projects {
			if strings.EqualFold(p.URL, url) {
				return true
			}
		}
		if containsProject(n.Children, url) {
			return true
		}
	}
	return false
}

// pruneEmpty 删除没有任何项目和子分类的空节点（递归自底向上）
func pruneEmpty(nodes *[]*CategoryNode) {
	var kept []*CategoryNode
	for _, n := range *nodes {
		pruneEmpty(&n.Children)
		if len(n.Projects) == 0 && len(n.Children) == 0 {
			continue
		}
		kept = append(kept, n)
	}
	*nodes = kept
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

// sortProjects 按 Star 降序稳定排序（Star 相同保持原顺序）
func sortProjects(projects []Project) {
	sort.SliceStable(projects, func(i, j int) bool {
		return projects[i].Stars > projects[j].Stars
	})
}

// ======== 辅助工具 ========

func extractField(body, fieldName string) string {
	safeFieldName := regexp.QuoteMeta(fieldName)
	re := regexp.MustCompile("(?m)^### " + safeFieldName + `\s*\n+([^\n]+)`)
	m := re.FindStringSubmatch(body)
	if len(m) > 1 {
		return strings.TrimSpace(m[1])
	}
	return ""
}

// normalizeInput 归一化表单输入：空值 / GitHub 未填写占位符 统一视为空串
func normalizeInput(s string) string {
	s = strings.TrimSpace(s)
	switch s {
	case "", "_No response_", "None":
		return ""
	}
	return s
}

var invalidSegmentRe = regexp.MustCompile(`["'` + "`" + `\[\]{}<>|#\\]|\r|\n`)

// splitPath 拆分并校验分类路径，防止注入破坏 Markdown 表格与 YAML 表单
func splitPath(p string) ([]string, error) {
	var res []string
	for _, s := range strings.Split(p, "/") {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if len(s) > 60 {
			return nil, fmt.Errorf("分类名过长: %q", s)
		}
		if invalidSegmentRe.MatchString(s) {
			return nil, fmt.Errorf("分类名含非法字符: %q", s)
		}
		res = append(res, s)
	}
	if len(res) == 0 {
		return nil, errors.New("分类路径为空")
	}
	return res, nil
}

var repoURLRe = regexp.MustCompile(`^https?://(?:www\.)?github\.com/([\w.-]+)/([\w.-]+?)(?:\.(?i:git))?(?:[/?#].*)?$`)

func parseOwnerRepo(u string) (owner, repo string, err error) {
	m := repoURLRe.FindStringSubmatch(strings.TrimSpace(u))
	if m == nil {
		return "", "", fmt.Errorf("invalid GitHub URL: %q", u)
	}
	return m[1], m[2], nil
}

func canonicalRepoURL(u string) (string, error) {
	owner, repo, err := parseOwnerRepo(u)
	if err != nil {
		return "", err
	}
	return "https://github.com/" + owner + "/" + repo, nil
}

// cleanMarkdownDesc 清洗描述文本，保证安全嵌入 Markdown 表格
func cleanMarkdownDesc(desc string) string {
	if desc == "" {
		return ""
	}
	desc = html.UnescapeString(desc)
	desc = strings.ReplaceAll(desc, "\r", "")
	desc = strings.ReplaceAll(desc, "\n", " ")
	desc = strings.ReplaceAll(desc, "|", "\\|")
	return strings.TrimSpace(desc)
}

func fetchRepoMeta(owner, repo, token string) (*Project, error) {
	url := fmt.Sprintf("%s/repos/%s/%s", apiBaseURL, owner, repo)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	if token != "" {
		req.Header.Set("Authorization", "token "+token)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API 返回 %d（%s/%s）", resp.StatusCode, owner, repo)
	}

	var d struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Language    string `json:"language"`
		HTMLURL     string `json:"html_url"`
		Stars       int    `json:"stargazers_count"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&d); err != nil {
		return nil, fmt.Errorf("解析 API 响应失败: %w", err)
	}

	return &Project{
		Name:        d.Name,
		URL:         d.HTMLURL,
		Description: cleanMarkdownDesc(d.Description),
		Language:    d.Language,
		Stars:       d.Stars,
	}, nil
}

func loadDB(path string) ([]*CategoryNode, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	if len(bytes.TrimSpace(raw)) == 0 {
		return nil, errors.New("data.json 为空，拒绝覆盖写入，请先恢复数据")
	}
	var db []*CategoryNode
	if err := json.Unmarshal(raw, &db); err != nil {
		return nil, fmt.Errorf("data.json 解析失败，拒绝覆盖写入: %w", err)
	}
	return db, nil
}

func saveData(path string, db []*CategoryNode) error {
	b, err := json.MarshalIndent(db, "", "  ")
	if err != nil {
		return err
	}
	b = append(b, '\n')
	return os.WriteFile(path, b, 0644)
}

func buildIssueForm(db []*CategoryNode) string {
	paths := getAllPaths(db, "")
	options := paths
	truncated := 0
	if len(options) > maxDropdownLen {
		options = options[:maxDropdownLen]
		truncated = len(paths) - maxDropdownLen
	}
	content := fmt.Sprintf(issueTemplateHeaderFmt, fieldRepoURL, fieldCategory)
	for _, p := range options {
		content += fmt.Sprintf("        - \"%s\"\n", p)
	}
	content += fmt.Sprintf(issueTemplateFooterFmt, fieldNewCategory)
	if truncated > 0 {
		content += fmt.Sprintf("# ⚠️ 分类超过 GitHub 表单下拉上限 %d 项，已截断 %d 项，请精简分类树\n", maxDropdownLen, truncated)
	}
	return content
}

func updateIssueTemplate(path, content string) error {
	return os.WriteFile(path, []byte(content), 0644)
}

var multiBlankRe = regexp.MustCompile(`\n{3,}`)

func collapseBlankLines(s string) string {
	return multiBlankRe.ReplaceAllString(s, "\n\n")
}

func renderView(tmplFile, outPath string, db []*CategoryNode) error {
	funcMap := template.FuncMap{
		"add":    func(a, b int) int { return a + b },
		"repeat": func(s string, n int) string { return strings.Repeat(s, n) },
		"dict": func(values ...interface{}) (map[string]interface{}, error) {
			if len(values)%2 != 0 {
				return nil, errors.New("invalid dict")
			}
			dict := make(map[string]interface{}, len(values)/2)
			for i := 0; i < len(values); i += 2 {
				dict[values[i].(string)] = values[i+1]
			}
			return dict, nil
		},
		"dynamicStar": func(u string) string {
			owner, repo, err := parseOwnerRepo(u)
			if err == nil {
				return fmt.Sprintf("![Star](https://img.shields.io/github/stars/%s/%s.svg?style=social&label=Star)", owner, repo)
			}
			return "N/A"
		},
	}
	t, err := template.New(filepath.Base(tmplFile)).Funcs(funcMap).ParseFiles(tmplFile)
	if err != nil {
		return err
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, db); err != nil {
		return err
	}
	out := collapseBlankLines(buf.String())
	out = strings.TrimRight(out, "\n") + "\n"
	return os.WriteFile(outPath, []byte(out), 0644)
}
