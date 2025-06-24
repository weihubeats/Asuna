package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"regexp"
	"strings"
)

func addRCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "addR",
		Short: "Add a new report to README.md",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("file name %s\n", fileName)
			lines, err := readFile(fileName)
			if err != nil {
				fmt.Println("读取文件时出错:", err)
				return
			}

			// 示例：|[`repo` ![](https://img.shields.io/github/stars/repo.svg?style=social&label=Star)](repo)|简介|语言|
			entry := fmt.Sprintf("|[`%s` ![](https://img.shields.io/github/stars/%s.svg?style=social&languages=Star)](%s)|%s|%s|",
				extractRepoName(repo),                           // 假设 repo 是完整的 URL，仅提取 owner/repo 用于 shield
				strings.TrimPrefix(repo, "https://github.com/"), // 用于 shield URL
				repo,
				name,
				languages)

			updatedLines, err := insertEntry(lines, title, entry)
			if err != nil {
				fmt.Println("插入条目时出错:", err)
				return
			}

			err = writeFile(fileName, updatedLines)
			if err != nil {
				fmt.Println("写入文件时出错:", err)
				return
			}

			fmt.Println("已成功将条目添加到 README.md！")
		},
	}
	cmd.Flags().StringVarP(&title, "title", "t", "", "Title to find in README.md (prefixed with ##)")
	cmd.Flags().StringVarP(&repo, "repo", "r", "", "Repository URL")
	cmd.Flags().StringVarP(&name, "name", "n", "", "Name of the entry")
	cmd.Flags().StringVarP(&languages, "languages", "l", "", "languages of the entry")
	cmd.Flags().StringVarP(&fileName, "fileName", "f", "README.md", "fileName")

	return cmd
}

func extractRepoName(url string) string {
	re := regexp.MustCompile(`github\.com/([^/]+/[^/]+)`)
	matches := re.FindStringSubmatch(url)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}
