package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestExtractField(t *testing.T) {
	body := "### GitHub 仓库地址\n\nhttps://github.com/foo/bar\n\n### 归属分类 (选择已有)\n\nAI / Skills\n"
	if got := extractField(body, fieldRepoURL); got != "https://github.com/foo/bar" {
		t.Errorf("repoURL = %q", got)
	}
	if got := extractField(body, fieldCategory); got != "AI / Skills" {
		t.Errorf("category = %q", got)
	}
	if got := extractField(body, "不存在的字段"); got != "" {
		t.Errorf("missing field = %q, want empty", got)
	}
}

func TestNormalizeInput(t *testing.T) {
	cases := map[string]string{
		"":              "",
		"  ":            "",
		"_No response_": "",
		"None":          "",
		" AI ":          "AI",
	}
	for in, want := range cases {
		if got := normalizeInput(in); got != want {
			t.Errorf("normalizeInput(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestSplitPath(t *testing.T) {
	parts, err := splitPath("后端 / Go / Web框架")
	if err != nil || len(parts) != 3 {
		t.Fatalf("splitPath = %v, %v", parts, err)
	}
	if parts[2] != "Web框架" {
		t.Errorf("parts[2] = %q", parts[2])
	}

	// 空段被跳过
	parts, err = splitPath("a // b")
	if err != nil || len(parts) != 2 {
		t.Fatalf("splitPath empty segs = %v, %v", parts, err)
	}

	// 非法字符
	for _, bad := range []string{"a|b", `a\b`, "a\"b", "a<b>", "a#b"} {
		if _, err := splitPath(bad); err == nil {
			t.Errorf("splitPath(%q) 应报错", bad)
		}
	}

	// 全空
	if _, err := splitPath(" / "); err == nil {
		t.Error("空路径应报错")
	}
}

func TestParseOwnerRepo(t *testing.T) {
	valid := map[string][2]string{
		"https://github.com/foo/bar":        {"foo", "bar"},
		"https://github.com/foo/bar/":       {"foo", "bar"},
		"https://github.com/foo/bar.git":    {"foo", "bar"},
		"http://www.github.com/foo/bar?x=1": {"foo", "bar"},
	}
	for in, want := range valid {
		o, r, err := parseOwnerRepo(in)
		if err != nil || o != want[0] || r != want[1] {
			t.Errorf("parseOwnerRepo(%q) = %q,%q,%v; want %v", in, o, r, err, want)
		}
	}

	invalid := []string{
		"",
		"github.com/foo/bar",
		"https://gitlab.com/foo/bar",
		"https://evil.com/github.com/foo/bar",
		"https://github.com/foo",
		"随便填的文本",
	}
	for _, in := range invalid {
		if _, _, err := parseOwnerRepo(in); err == nil {
			t.Errorf("parseOwnerRepo(%q) 应报错", in)
		}
	}
}

func TestCanonicalRepoURL(t *testing.T) {
	got, err := canonicalRepoURL("https://github.com/Foo/Bar.Git/")
	if err != nil {
		t.Fatal(err)
	}
	want := "https://github.com/Foo/Bar"
	if got != want {
		t.Errorf("canonical = %q, want %q", got, want)
	}
}

func TestCleanMarkdownDesc(t *testing.T) {
	got := cleanMarkdownDesc("a &amp; b &#39;c&#39;\nsecond | line\r\n")
	want := `a & b 'c' second \| line`
	if got != want {
		t.Errorf("cleanMarkdownDesc = %q, want %q", got, want)
	}
	if got := cleanMarkdownDesc(""); got != "" {
		t.Errorf("empty desc = %q", got)
	}
}

func TestFindOrCreateNodeReuse(t *testing.T) {
	var db []*CategoryNode
	findOrCreateNode(&db, []string{"A", "B"})
	n := findOrCreateNode(&db, []string{"A", "B"})
	if len(db) != 1 || db[0].Name != "A" {
		t.Fatalf("db = %+v", db)
	}
	if len(db[0].Children) != 1 || db[0].Children[0].Name != "B" {
		t.Fatalf("children = %+v", db[0].Children)
	}
	if n != db[0].Children[0] {
		t.Error("应复用已有节点")
	}
}

func TestContainsProjectAndRecursiveDelete(t *testing.T) {
	db := []*CategoryNode{{
		Name: "cat",
		Projects: []Project{
			{Name: "a", URL: "https://github.com/x/a"},
			{Name: "b", URL: "https://github.com/x/b"},
		},
	}}
	if !containsProject(db, "https://github.com/X/A") {
		t.Error("大小写不敏感匹配失败")
	}
	if containsProject(db, "https://github.com/x/c") {
		t.Error("不应误报存在")
	}
	if !recursiveDelete(db, "https://github.com/x/a") {
		t.Error("删除应返回 true")
	}
	if len(db[0].Projects) != 1 || recursiveDelete(db, "https://github.com/x/zzz") {
		t.Error("删除不存在项目应返回 false")
	}
}

func TestPruneEmpty(t *testing.T) {
	db := []*CategoryNode{
		{Name: "keep", Projects: []Project{{Name: "p"}}},
		{Name: "empty-leaf"},
		{Name: "empty-parent", Children: []*CategoryNode{
			{Name: "inner-empty"},
			{Name: "inner-keep", Projects: []Project{{Name: "q"}}},
		}},
	}
	pruneEmpty(&db)
	if len(db) != 2 {
		t.Fatalf("顶层节点数 = %d, want 2", len(db))
	}
	parent := db[1]
	if parent.Name != "empty-parent" || len(parent.Children) != 1 || parent.Children[0].Name != "inner-keep" {
		t.Errorf("空父节点未正确收敛: %+v", parent)
	}
}

// getAllPaths 必须 BFS：截断时根分类完整保留（C1/M5）
func TestGetAllPathsBFSOrder(t *testing.T) {
	db := []*CategoryNode{
		{Name: "A", Children: []*CategoryNode{
			{Name: "A1", Children: []*CategoryNode{{Name: "A1a"}}},
			{Name: "A2"},
		}},
		{Name: "B", Children: []*CategoryNode{{Name: "B1"}}},
		{Name: "C"},
	}
	got := getAllPaths(db, "")
	want := []string{"A", "B", "C", "A / A1", "A / A2", "B / B1", "A / A1 / A1a"}
	if len(got) != len(want) {
		t.Fatalf("paths = %v, want %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("paths[%d] = %q, want %q (full: %v)", i, got[i], want[i], got)
		}
	}
}

// buildIssueForm 截断时必须保留全部根分类
func TestBuildIssueFormTruncationKeepsRoots(t *testing.T) {
	var db []*CategoryNode
	for i := 0; i < maxDropdownLen+10; i++ {
		name := fmt.Sprintf("根%02d", i)
		db = append(db, &CategoryNode{Name: name, Projects: []Project{{Name: "p", URL: "https://github.com/x/y"}}})
	}
	form := buildIssueForm(db)
	if !strings.Contains(form, "根00\"") && !strings.Contains(form, `- "根00"`) {
		t.Errorf("根00 应保留:\n%s", form)
	}
	if !strings.Contains(form, fmt.Sprintf("已截断 10 项")) {
		t.Errorf("应包含截断提示:\n%s", form)
	}
	// 最后一个根分类（第 51 个）在 BFS 下拉上限外
	if strings.Contains(form, `"根50"`) {
		t.Errorf("第 51 项应被截断:\n%s", form)
	}
}

func TestFindOrCreateNodeEmptyPath(t *testing.T) {
	var db []*CategoryNode
	if n := findOrCreateNode(&db, nil); n != nil {
		t.Errorf("空 path 应返回 nil, got %+v", n)
	}
	if len(db) != 0 {
		t.Errorf("空 path 不应创建节点: %+v", db)
	}
}

func TestSortProjects(t *testing.T) {
	ps := []Project{
		{Name: "old-first", Stars: 0},
		{Name: "high", Stars: 100},
		{Name: "mid", Stars: 50},
		{Name: "zero", Stars: 0},
	}
	sortProjects(ps)
	if ps[0].Name != "high" || ps[1].Name != "mid" {
		t.Errorf("排序错误: %+v", ps)
	}
	// Star 相同保持稳定
	if ps[2].Name != "old-first" || ps[3].Name != "zero" {
		t.Errorf("稳定性破坏: %+v", ps)
	}
}

func TestLoadDBRejectCorrupt(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "bad.json")
	os.WriteFile(p, []byte("{corrupt"), 0644)
	if _, err := loadDB(p); err == nil {
		t.Fatal("损坏 JSON 应报错而不是静默清库")
	}

	// 缺文件必须报错（调用方按 actionType 决定是否容忍，禁止静默 nil）
	p2 := filepath.Join(dir, "missing.json")
	if _, err := loadDB(p2); err == nil {
		t.Error("缺失文件应报错，由调用方显式处理")
	}

	// 空文件拒绝覆盖
	p3 := filepath.Join(dir, "empty.json")
	os.WriteFile(p3, []byte("  \n"), 0644)
	if _, err := loadDB(p3); err == nil {
		t.Error("空文件应报错")
	}
}

func TestFetchRepoMetaNon200(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"message":"Not Found"}`))
	}))
	defer srv.Close()

	old := apiBaseURL
	apiBaseURL = srv.URL
	defer func() { apiBaseURL = old }()

	if _, err := fetchRepoMeta("x", "y", ""); err == nil {
		t.Fatal("404 应返回 error，禁止写入空垃圾行")
	}
}

func TestFetchRepoMetaOK(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Accept") != "application/vnd.github+json" {
			t.Error("缺少 Accept header")
		}
		w.Write([]byte(`{"name":"demo","description":"a|b","language":"Go","html_url":"https://github.com/o/demo","stargazers_count":42}`))
	}))
	defer srv.Close()

	old := apiBaseURL
	apiBaseURL = srv.URL
	defer func() { apiBaseURL = old }()

	p, err := fetchRepoMeta("o", "demo", "")
	if err != nil {
		t.Fatal(err)
	}
	if p.Stars != 42 || p.Language != "Go" || p.Description != `a\|b` {
		t.Errorf("meta = %+v", p)
	}
}

// ======== 产物 golden 测试 ========

func loadTestDB(t *testing.T) []*CategoryNode {
	t.Helper()
	db, err := loadDB(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	return db
}

func TestIssueFormMatchesCommitted(t *testing.T) {
	got := buildIssueForm(loadTestDB(t))
	want, err := os.ReadFile(issueFormPath)
	if err != nil {
		t.Fatal(err)
	}
	if strings.TrimRight(got, "\n") != strings.TrimRight(string(want), "\n") {
		t.Error("生成的 Issue 表单与仓库内文件不一致，运行 REGEN=1 go test 更新产物")
	}
}

// REGEN=1 go test ./... 可重新生成 Issue 表单
func TestRegenerateArtifacts(t *testing.T) {
	if os.Getenv("REGEN") == "" {
		t.Skip("set REGEN=1 to refresh issue form")
	}
	db := loadTestDB(t)
	// render 模式不再 prune；REGEN 走 issue-delete 同源路径，保留 prune 验证
	pruneEmpty(&db)
	if err := updateIssueTemplate(issueFormPath, buildIssueForm(db)); err != nil {
		t.Fatal(err)
	}
}
