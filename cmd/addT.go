package cmd

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
)

func addTCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "addT",
		Short: "Add a new title entry to README.md",
		Run: func(cmd *cobra.Command, args []string) {
			filePath := "README.md"
			lines, err := readFile(filePath)
			if err != nil {
				fmt.Println("Error reading file:", err)
				return
			}

			// 在类似 `- [未整理分类](#未整理分类)` 的行后面新增一行
			newLines, err := insertLink(lines, title)
			if err != nil {
				fmt.Println("Error inserting link:", err)
				return
			}

			// 在文件末尾添加内容
			newLines = append(newLines, "", fmt.Sprintf("## %s", title), "aaa", "bbbb")

			// 将修改后的内容写回文件
			err = writeFile(filePath, newLines)
			if err != nil {
				fmt.Println("Error writing file:", err)
				return
			}

			fmt.Println("addT success")
		},
	}

	cmd.Flags().StringVarP(&title, "title", "t", "", "Title to add")
	return cmd
}

func insertLink(lines []string, title string) ([]string, error) {
	link := fmt.Sprintf("- [%s](#%s)", title, title)
	for i, line := range lines {
		if strings.Contains(line, "- [未整理分类](#未整理分类)") {
			// 在目标行后面插入新链接
			lines = append(lines[:i+1], append([]string{link}, lines[i+1:]...)...)
			return lines, nil
		}
	}
	return nil, fmt.Errorf("target line not found")
}
