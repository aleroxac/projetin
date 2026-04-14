package configs

import (
	"log/slog"
	"os"
	"reflect"

	"github.com/spf13/viper"
)

type Config struct {
	DBDriver   string `mapstructure:"DB_DRIVER"`
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`

	APIPort string `mapstructure:"API_PORT"`
	APIHost string `mapstructure:"API_HOST"`

	AIProvider string `mapstructure:"AI_PROVIDER"`
	AIENDPOINT string `mapstructure:"AI_ENDPOINT"`
	AIModel    string `mapstructure:"AI_MODEL"`
	AIAPIKey   string `mapstructure:"AI_API_KEY"`
}

// Load all environment variables needed to run the app properly
func LoadConfig(path string) (*Config, error) {
	var cfg *Config

	// 1. Basic Viper setup
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(path)
	viper.AutomaticEnv()

	// 2. Automate Environment Variable Binding using Reflection
	// This ensures that any new field added to the 'conf' struct
	// with a 'mapstructure' tag is automatically bound to Viper.
	bindEnvs(Config{})

	// 3. Try to read .env file
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok && !os.IsNotExist(err) {
			slog.Warn("Warning: error reading config file: %v", slog.Any("error", err))
		} else {
			slog.Info(".env file not found. Using system environment variables.")
		}
	}

	// 4. Unmarshal values into the struct
	err := viper.Unmarshal(&cfg)
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

// Iterates through struct tags to bind environment variables automatically.
func bindEnvs(iface interface{}) {
	t := reflect.TypeOf(iface)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		// Get the value of the 'mapstructure' tag
		tag := field.Tag.Get("mapstructure")
		if tag != "" {
			// Explicitly bind the tag name to an environment variable
			viper.BindEnv(tag)
		}
	}
}
