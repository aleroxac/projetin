package gemini

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	ai "github.com/aleroxac/projetin/internal/infra/ai"
)

const defaultEndpoint = "https://generativelanguage.googleapis.com"
const defaultModel = "gemini-2.5-flash"

type Provider struct {
	endpoint string
	model    string
	apiKey   string
	client   *http.Client
}

func NewProvider(endpoint, model, apiKey string) *Provider {
	if endpoint == "" {
		endpoint = defaultEndpoint
	}
	if model == "" {
		model = defaultModel
	}

	transport := &http.Transport{
		MaxIdleConns:        10,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,
	}

	return &Provider{
		endpoint: endpoint,
		model:    model,
		apiKey:   apiKey,
		client:   &http.Client{Transport: transport},
	}
}

// Gemini REST request/response structures
type part struct {
	Text string `json:"text"`
}

type content struct {
	Parts []part `json:"parts"`
}

type schema struct {
	Type       string            `json:"type"`
	Properties map[string]schema `json:"properties,omitempty"`
	Items      *schema           `json:"items,omitempty"`
	Required   []string          `json:"required,omitempty"`
}

type generationConfig struct {
	ResponseMIMEType string         `json:"responseMimeType"`
	ThinkingConfig   thinkingConfig `json:"thinkingConfig"`
	ResponseSchema   schema         `json:"responseSchema"`
}

type thinkingConfig struct {
	ThinkingBudget int `json:"thinkingBudget"`
}

type generateRequest struct {
	Contents         []content        `json:"contents"`
	GenerationConfig generationConfig `json:"generationConfig"`
}

type candidate struct {
	Content content `json:"content"`
}

type generateResponse struct {
	Candidates []candidate `json:"candidates"`
}

type estimationResponse struct {
	Items []ai.MealItemEstimate `json:"items"`
}

func (p *Provider) Ping(ctx context.Context) error {
	url := fmt.Sprintf("%s/v1beta/models?key=%s", p.endpoint, p.apiKey)
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
	prompt := fmt.Sprintf(`Estimate macronutrients for each food item in this meal: "%s"`, description)

	// 	prompt := fmt.Sprintf(`You are a nutrition expert. Analyze the following meal description and estimate the macronutrients for each food item.
	// Meal description: "%s"

	// Return a JSON object with an "items" array. For each food item provide:
	// - item: the name of the food
	// - quantity: numeric amount
	// - unit: unit of measurement (e.g., "g", "ml", "unit", "cup", "tbsp")
	// - protein: grams of protein (float)
	// - carbs: grams of carbohydrates (float)
	// - fat: grams of fat (float)
	// - calories: total calories (float)

	// Use standard nutritional reference values. Be precise and realistic.`, description)

	itemSchema := schema{
		Type: "object",
		Properties: map[string]schema{
			"item":     {Type: "string"},
			"quantity": {Type: "number"},
			"unit":     {Type: "string"},
			"protein":  {Type: "number"},
			"carbs":    {Type: "number"},
			"fat":      {Type: "number"},
			"calories": {Type: "number"},
		},
		Required: []string{"item", "quantity", "unit", "protein", "carbs", "fat", "calories"},
	}

	reqBody := generateRequest{
		Contents: []content{{Parts: []part{{Text: prompt}}}},
		GenerationConfig: generationConfig{
			ResponseMIMEType: "application/json",
			ThinkingConfig:   thinkingConfig{ThinkingBudget: 0},
			ResponseSchema: schema{
				Type: "object",
				Properties: map[string]schema{
					"items": {
						Type:  "array",
						Items: &itemSchema,
					},
				},
				Required: []string{"items"},
			},
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	url := fmt.Sprintf("%s/v1beta/models/%s:generateContent?key=%s", p.endpoint, p.model, p.apiKey)
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
		return nil, fmt.Errorf("gemini api error %d: %s", resp.StatusCode, string(respBytes))
	}

	var genResp generateResponse
	if err := json.Unmarshal(respBytes, &genResp); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}
	if len(genResp.Candidates) == 0 || len(genResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from gemini")
	}

	jsonText := genResp.Candidates[0].Content.Parts[0].Text
	var estimation estimationResponse
	if err := json.Unmarshal([]byte(jsonText), &estimation); err != nil {
		return nil, fmt.Errorf("unmarshal estimation: %w", err)
	}

	return estimation.Items, nil
}
