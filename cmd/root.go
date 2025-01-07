package cmd

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

var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "A CLI tool to manage README.md",
}

func Execute() {

	rootCmd.AddCommand(addTCmd())
	rootCmd.AddCommand(addRCmd())

	fmt.Printf("Welcome to the Asuna")
	fmt.Println("Available commands:")
	fmt.Println("addR -t 消息中间件 -r https://github.com/weihubeats/fluxcache -n 多级缓存框架 -l java")

	for {
		fmt.Print("> ")
		scanner := bufio.NewScanner(os.Stdin)
		if scanner.Scan() {
			input := scanner.Text()
			if input == "exit" {
				break
			}

			rootCmd.SetArgs(strings.Fields(input))
			if err := rootCmd.Execute(); err != nil {
				fmt.Println("Error:", err)
			}
		}
	}
}

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
