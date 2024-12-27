package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"strings"
)

func init() {
	rootCmd.Flags().StringVarP(&title, "title", "t", "", "Title to find in README.md (prefixed with ##)")
	rootCmd.Flags().StringVarP(&repo, "repo", "r", "", "Repository URL")
	rootCmd.Flags().StringVarP(&name, "name", "n", "", "Name of the entry")
	rootCmd.Flags().StringVarP(&label, "label", "l", "", "Label of the entry")
}

func addRCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "addR",
		Short: "Add a new entry to README.md",
		Run: func(cmd *cobra.Command, args []string) {
			repoParts := strings.Split(repo, "/")
			repoName := repoParts[3] + "/" + repoParts[4]
			entry := fmt.Sprintf("[`%s` ![](https://img.shields.io/github/stars/%s.svg?style=social&label=Star)](%s)|%s|%s",
				repoName, // 提取仓库名称
				repoName, // 提取仓库名称
				repo, name, label)

			filePath := "README.md"
			lines, err := readFile(filePath)
			if err != nil {
				fmt.Println("Error reading file:", err)
				return
			}

			newLines, err := insertEntry(lines, title, entry)
			if err != nil {
				fmt.Println("Error inserting entry:", err)
				return
			}

			err = writeFile(filePath, newLines)
			if err != nil {
				fmt.Println("Error writing file:", err)
				return
			}

			fmt.Println("add success")
		},
	}
	cmd.Flags().StringVarP(&title, "title", "t", "", "Title to find in README.md (prefixed with ##)")
	cmd.Flags().StringVarP(&repo, "repo", "r", "", "Repository URL")
	cmd.Flags().StringVarP(&name, "name", "n", "", "Name of the entry")
	cmd.Flags().StringVarP(&label, "label", "l", "", "Label of the entry")
	return cmd
}
