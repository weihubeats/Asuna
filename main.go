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

type Project struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Language    string `json:"language"`
	Stars       int    `json:"stars"`
}

type CategoryGroup struct {
	Category string    `json:"category"`
	Projects []Project `json:"projects"`
}

func main() {
	actionType := os.Getenv("ACTION_TYPE")
	issueBody := os.Getenv("ISSUE_BODY")
	githubToken := os.Getenv("GITHUB_TOKEN")

	if actionType == "" || issueBody == "" {
		fmt.Println("缺少必要的环境变量参数 (ACTION_TYPE/ISSUE_BODY)")
		os.Exit(1)
	}

	// 从 Issue Body 中精准提取 URL
	repoURL := extractField(issueBody, "GitHub 仓库地址")
	if repoURL == "" {
		fmt.Println("无法解析仓库 URL")
		os.Exit(1)
	}

	// 统一加载持久化数据
	dbPath := "data.json"
	db := loadData(dbPath)

	// 路由执行对应的业务逻辑
	switch actionType {
	case "add":
		category := extractField(issueBody, "归属分类")
		if category == "" {
			fmt.Println("未提取到分类信息")
			os.Exit(1)
		}
		handleAdd(db, repoURL, category, githubToken)
	case "delete":
		handleDelete(&db, repoURL)
	default:
		fmt.Println("不支持的 ACTION_TYPE:", actionType)
		os.Exit(1)
	}

	// 事务提交：数据落盘与视图重新渲染
	saveData(dbPath, db)
	renderView("README.md.tmpl", "README.md", db)
	fmt.Printf("✅ 操作 [%s] 执行完毕并同步渲染成功！\n", actionType)
}

// ======== 业务逻辑模块 ========

func handleAdd(db []CategoryGroup, repoURL, category, token string) {
	// 校验库中是否已存在，防止重复收录脏数据
	for _, group := range db {
		for _, p := range group.Projects {
			if strings.EqualFold(p.URL, repoURL) {
				fmt.Printf("拦截: 仓库 %s 已存在于 [%s] 分类下\n", repoURL, group.Category)
				os.Exit(0) // 正常退出，不需要报错
			}
		}
	}

	owner, repo := parseGitHubURL(repoURL)
	projectInfo, err := fetchRepoMeta(owner, repo, token)
	if err != nil {
		fmt.Println("API 请求元数据失败:", err)
		os.Exit(1)
	}

	// 将新数据路由到对应分类，若无此分类则初始化
	foundCategory := false
	for i := range db {
		if db[i].Category == category {
			db[i].Projects = append(db[i].Projects, *projectInfo)
			foundCategory = true
			break
		}
	}
	if !foundCategory {
		fmt.Println("错误：未找到对应分类，请检查 data.json 是否存在该 Category:", category)
		os.Exit(1)
	}
}

func handleDelete(db *[]CategoryGroup, repoURL string) {
	for i, group := range *db {
		var updatedProjects []Project
		for _, p := range group.Projects {
			if !strings.EqualFold(p.URL, repoURL) {
				updatedProjects = append(updatedProjects, p)
			}
		}
		(*db)[i].Projects = updatedProjects
	}
}

// ======== 底层工具与 API 模块 ========

// 利用正则从 GitHub Issue Body 中提取字段值
func extractField(body, fieldName string) string {
	re := regexp.MustCompile(fmt.Sprintf(`(?m)^### %s\s*\n+([^\n]+)`, fieldName))
	matches := re.FindStringSubmatch(body)
	if len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	return ""
}

func parseGitHubURL(url string) (string, string) {
	re := regexp.MustCompile(`github\.com/([^/]+)/([^/]+)`)
	matches := re.FindStringSubmatch(url)
	if len(matches) != 3 {
		fmt.Println("非法的 GitHub 仓库 URL:", url)
		os.Exit(1)
	}
	return matches[1], strings.TrimSuffix(matches[2], ".git")
}

func fetchRepoMeta(owner, repo, token string) (*Project, error) {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repo)
	req, _ := http.NewRequest("GET", apiURL, nil)
	if token != "" {
		req.Header.Set("Authorization", "token "+token)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return nil, fmt.Errorf("GitHub API 请求异常 (HTTP %d)", resp.StatusCode)
	}
	defer resp.Body.Close()

	var data struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Language    string `json:"language"`
		Stars       int    `json:"stargazers_count"`
		HTMLURL     string `json:"html_url"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	// 安全转义处理，防止被注入恶意标记破坏页面布局
	return &Project{
		Name:        html.EscapeString(data.Name),
		URL:         data.HTMLURL,
		Description: html.EscapeString(data.Description),
		Language:    html.EscapeString(data.Language),
		Stars:       data.Stars,
	}, nil
}

func loadData(filename string) []CategoryGroup {
	data, err := os.ReadFile(filename)
	if err != nil {
		fmt.Println("读取底层数据源失败:", err)
		os.Exit(1)
	}
	var db []CategoryGroup
	json.Unmarshal(data, &db)
	return db
}

func saveData(filename string, db []CategoryGroup) {
	data, _ := json.MarshalIndent(db, "", "  ")
	os.WriteFile(filename, data, 0644)
}

func renderView(tmplPath, outputPath string, db []CategoryGroup) {
	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		fmt.Println("加载模板引擎失败:", err)
		os.Exit(1)
	}
	outFile, _ := os.Create(outputPath)
	defer outFile.Close()
	tmpl.Execute(outFile, db)
}
