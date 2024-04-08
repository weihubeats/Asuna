package main

import "C"
import (
	"Asuna/config"
	"bufio"
	"fmt"
	"github.com/spf13/cobra"
	"os"
	"strings"
)

func main() {
	/**
	addT -t weihubeats
	*/
	var rootCmd = &cobra.Command{Use: "app"}
	var title, repo, url, name, lang string
	var level int

	var addTCmd = &cobra.Command{
		Use:   "addT",
		Short: "Add a title to readme.md",
		Run: func(cmd *cobra.Command, args []string) {
			appendTitle(title, level)
		},
	}
	addTCmd.Flags().StringVarP(&title, "title", "t", "", "Title to add")
	addTCmd.Flags().IntVarP(&level, "level", "n", 3, "Title level")

	var addRCmd = &cobra.Command{
		Use:   "addR",
		Short: "Add a repository to readme.md",
		Run: func(cmd *cobra.Command, args []string) {
			appendRepo(title, repo, url, name, lang)
		},
	}
	addRCmd.Flags().StringVarP(&title, "title", "t", "", "Title")
	addRCmd.Flags().StringVarP(&repo, "repo", "r", "", "Repository URL")
	addRCmd.Flags().StringVarP(&url, "url", "u", "", "URL")
	addRCmd.Flags().StringVarP(&name, "name", "n", "", "Name")
	addRCmd.Flags().StringVarP(&lang, "lang", "l", "", "Language")

	rootCmd.AddCommand(addTCmd, addRCmd)
	rootCmd.Execute()

	reader := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("Enter command: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)
		if input == "exit" {
			fmt.Println("Exiting...")
			os.Exit(0)
		}
		args := strings.Split(input, " ")
		rootCmd.SetArgs(args)
		rootCmd.Execute()
	}
}

func appendTitle(title string, level int) {
	file, err := os.OpenFile("README.md", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	var prefix string
	for i := 0; i < level; i++ {
		prefix += "#"
	}
	fmt.Println(config.C.TitleTemplate)
	if _, err := file.WriteString(fmt.Sprintf("\n%s %s\n%s", prefix, title, config.C.TitleTemplate)); err != nil {
		fmt.Println("Error writing to file:", err)
	}
}

func appendRepo(title, repo, url, name, lang string) {
	file, err := os.OpenFile("readme.md", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	content := fmt.Sprintf("[`%s` ![](https://img.shields.io/github/stars/%s.svg?style=social&label=Star)](%s)|%s|%s\n", repo, repo, url, name, lang)
	if _, err := file.WriteString(content); err != nil {
		fmt.Println("Error writing to file:", err)
	}
}
