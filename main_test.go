package main

import (
	"bytes"
	"os"
	"os/exec"
	"strings"
	"testing"
)

var (
	fileName = "README_Test.md"
)

func TestMainWithAddRCommand(t *testing.T) {

	// 跳过构建步骤，如果这个测试只是为了确认操作而不是为了CI/CD
	if testing.Short() {
		t.Skip("跳过需要构建的测试")
	}

	// 构建当前包以创建可执行文件
	tmpBin := "./test-cli-bin"
	buildCmd := exec.Command("go", "build", "-o", tmpBin)
	if err := buildCmd.Run(); err != nil {
		t.Fatalf("无法构建测试二进制文件: %v", err)
	}
	defer func(name string) {
		err := os.Remove(name)
		if err != nil {
			t.Errorf("<UNK>: %v", err)
		}
	}(tmpBin)

	// 测试用例
	testCases := []struct {
		name        string
		args        []string
		checkFunc   func(t *testing.T, readmeContent string) bool
		expectedErr bool
	}{
		{
			name: "Add fluxCache repository",
			args: []string{
				"addR",
				"-t", "缓存",
				"-r", "https://github.com/weihubeats/fluxcache",
				"-n", "多级缓存框架",
				"-l", "Java",
				"-f", "README_Test.md",
			},
			checkFunc: func(t *testing.T, readmeContent string) bool {
				return strings.Contains(readmeContent, "weihubeats/fluxcache") &&
					strings.Contains(readmeContent, "多级缓存框架") &&
					strings.Contains(readmeContent, "Java")
			},
			expectedErr: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			originalContent, _ := os.ReadFile(fileName)
			// 准备命令
			cmd := exec.Command(tmpBin, tc.args...)
			var stdout, stderr bytes.Buffer
			cmd.Stdout = &stdout
			cmd.Stderr = &stderr
			// 执行命令
			err := cmd.Run()
			// 检查错误情况
			if tc.expectedErr && err == nil {
				t.Errorf("预期应该发生错误，但没有发生")
			} else if !tc.expectedErr && err != nil {
				t.Errorf("预期不应该发生错误，但发生了: %v\nStderr: %s", err, stderr.String())
			}
			// 读取更新后的文件
			updatedContent, err := os.ReadFile(fileName)
			if err != nil {
				t.Fatalf("无法读取更新后的README文件: %v", err)
			}
			// 检查文件内容是否符合预期
			if !tc.expectedErr && !tc.checkFunc(t, string(updatedContent)) {
				t.Errorf("文件内容未按预期更新\nStdout: %s\nStderr: %s", stdout.String(), stderr.String())
			}

			// 如果不期望错误但仍然失败，打印更多调试信息
			if !tc.expectedErr && err != nil {
				t.Logf("原始内容:\n%s", string(originalContent))
				t.Logf("更新后内容:\n%s", string(updatedContent))
			}
			// 重置文件内容以便下一个测试
			os.WriteFile(fileName, originalContent, 0644)

		})

	}

}
