package models

type RuleImage struct {
	ID  string `json:"id"`
	Src string `json:"src"`
	Alt string `json:"alt"`
}

type Rule struct {
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Images      []RuleImage `json:"images,omitempty"`
}
