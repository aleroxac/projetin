package ollama

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	ai "github.com/aleroxac/projetin/internal/infra/ai"
)

const defaultEndpoint = "http://localhost:11434"
const defaultModel = "mistral:7b-instruct"

type Provider struct {
	endpoint string
	model    string
	client   *http.Client
}

func NewProvider(endpoint, model string) *Provider {
	if endpoint == "" {
		endpoint = defaultEndpoint
	}
	if model == "" {
		model = defaultModel
	}
	return &Provider{
		endpoint: endpoint,
		model:    model,
		client:   &http.Client{},
	}
}

// Ollama Chat API request/response structures
type messageContent struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model    string           `json:"model"`
	Messages []messageContent `json:"messages"`
	Stream   bool             `json:"stream"`
	Format   string           `json:"format"`
}

type chatResponse struct {
	Message messageContent `json:"message"`
}

type estimationResponse struct {
	Items []ai.MealItemEstimate `json:"items"`
}

func (p *Provider) Ping(ctx context.Context) error {
	url := fmt.Sprintf("%s/api/tags", p.endpoint)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	resp, err := p.client.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status: %d", resp.StatusCode)
	}
	return nil
}

func (p *Provider) EstimateMacros(ctx context.Context, description string) ([]ai.MealItemEstimate, error) {
	prompt := fmt.Sprintf(`You are a nutrition expert. Analyze the following meal description and estimate the macronutrients for each food item.
Meal description: "%s"

Return a JSON object with an "items" array. For each food item provide:
- item: the name of the food
- quantity: numeric amount
- unit: unit of measurement (e.g., "g", "ml", "unit", "cup", "tbsp")
- protein: grams of protein (float)
- carbs: grams of carbohydrates (float)
- fat: grams of fat (float)
- calories: total calories (float)

Use standard nutritional reference values. Be precise and realistic.
Respond with only the JSON object, no additional text.`, description)

	reqBody := chatRequest{
		Model: p.model,
		Messages: []messageContent{
			{Role: "user", Content: prompt},
		},
		Stream: false,
		Format: "json",
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	url := fmt.Sprintf("%s/api/chat", p.endpoint)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama api error %d: %s", resp.StatusCode, string(respBytes))
	}

	var chatResp chatResponse
	if err := json.Unmarshal(respBytes, &chatResp); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}
	if chatResp.Message.Content == "" {
		return nil, fmt.Errorf("empty response from ollama")
	}

	var estimation estimationResponse
	if err := json.Unmarshal([]byte(chatResp.Message.Content), &estimation); err != nil {
		return nil, fmt.Errorf("unmarshal estimation: %w", err)
	}

	return estimation.Items, nil
}
