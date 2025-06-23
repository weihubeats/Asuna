package main

import "C"
import (
	"bufio"
	"fmt"
	"github.com/spf13/cobra"
	"os"
	"regexp"
	"strings"
)

var (
	title string
	repo  string
	name  string
	label string
)

func main() {
	Execute()
}

var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "一个用于管理 README.md 的 CLI 工具",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cmd.Help()
			return
		}
	},
}

func Execute() {
	rootCmd.AddCommand(addRCmd())
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "错误: %v\n", err)
		os.Exit(1)
	}
}

// addRCmd 函数（假设这是您添加仓库的命令）
func addRCmd() *cobra.Command {
	addR := &cobra.Command{
		Use:   "addR",
		Short: "向 README.md 添加新的仓库条目",
		Run: func(cmd *cobra.Command, args []string) {
			filePath := "README.md" // 确保此路径相对于 GitHub Action 的工作目录是正确的

			lines, err := readFile(filePath)
			if err != nil {
				fmt.Println("读取文件时出错:", err)
				return
			}

			// 根据您的 README.md 结构格式化条目
			// 示例：|[`repo` ![](https://img.shields.io/github/stars/repo.svg?style=social&label=Star)](repo)|简介|语言|
			entry := fmt.Sprintf("|[`%s` ![](https://img.shields.io/github/stars/%s.svg?style=social&label=Star)](%s)|%s|%s|",
				extractRepoName(repo),                           // 假设 repo 是完整的 URL，仅提取 owner/repo 用于 shield
				strings.TrimPrefix(repo, "https://github.com/"), // 用于 shield URL
				repo,
				name,
				label) // 将 'label' 用于语言

			updatedLines, err := insertEntry(lines, title, entry)
			if err != nil {
				fmt.Println("插入条目时出错:", err)
				return
			}

			err = writeFile(filePath, updatedLines)
			if err != nil {
				fmt.Println("写入文件时出错:", err)
				return
			}

			fmt.Println("已成功将条目添加到 README.md！")
		},
	}
	addR.Flags().StringVarP(&title, "title", "t", "", "要添加条目的部分的标题（例如，'消息中间件'）")
	addR.Flags().StringVarP(&repo, "repo", "r", "", "仓库 URL（例如，'https://github.com/owner/repo'）")
	addR.Flags().StringVarP(&name, "name", "n", "", "项目名称或描述")
	addR.Flags().StringVarP(&label, "label", "l", "", "语言标签（例如，'java'、'go'、'多语言'）") // 映射到您原始代码中的 'label'
	addR.MarkFlagRequired("title")
	addR.MarkFlagRequired("repo")
	addR.MarkFlagRequired("name")

	return addR
}

func extractRepoName(url string) string {
	re := regexp.MustCompile(`github\.com/([^/]+/[^/]+)`)
	matches := re.FindStringSubmatch(url)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// 您现有的 readFile、insertEntry、writeFile 函数保持不变
func readFile(filePath string) ([]string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines, scanner.Err()
}

func insertEntry(lines []string, title, entry string) ([]string, error) {
	// 构建正则表达式，匹配任意数量的 # 后跟空格和 title
	pattern := fmt.Sprintf(`^#+\s+%s\s*$`, regexp.QuoteMeta(title))
	re, err := regexp.Compile(pattern)
	if err != nil {
		return nil, fmt.Errorf("invalid regex pattern: %v", err)
	}

	for i, line := range lines {
		if re.MatchString(line) {
			// 找到目标行，在其下方第三行插入内容
			insertIndex := i + 3
			if insertIndex > len(lines) {
				insertIndex = len(lines)
			}
			lines = append(lines[:insertIndex], append([]string{entry}, lines[insertIndex:]...)...)
			return lines, nil
		}
	}
	return nil, fmt.Errorf("title '%s' not found", title)
}

func writeFile(filePath string, lines []string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	for _, line := range lines {
		_, err := writer.WriteString(line + "\n")
		if err != nil {
			return err
		}
	}
	return writer.Flush()
}
