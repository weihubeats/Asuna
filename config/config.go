package config

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

var (
	C    *Config
	once sync.Once
)

type Config struct {
	TitleTemplate string
}

func init() {
	once.Do(func() {

		dir, err := os.Getwd()
		titleTemplatePath := filepath.Join(filepath.Dir(dir), "Asuna", "doc", "titleTemplate.md")

		titleTemplate, err := os.ReadFile(titleTemplatePath)

		if err != nil {
			fmt.Printf("Failed to read config file: %s\n", err)
			return
		}
		config := Config{}
		C = &config
		C.TitleTemplate = string(titleTemplate)

	})
}
