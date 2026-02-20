package apiAdmin

import (
	"backend/models"
	"backend/services"
	"encoding/json"
	"net/http"
)

type CreateRule struct {
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Images      []models.RuleImage `json:"images"`
}

func AddNewRule(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateRule
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	newRule, err := services.CreateRule(
		req.Title,
		req.Description,
		req.Images,
	)
	if err != nil {
		http.Error(w, "Failed to create rule", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newRule)
}

func DeleteRule(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req string
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	rule, err := services.DeleteRule(req)

	if err != nil {
		http.Error(w, "Failed to delete rule", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rule)

}

func EditRule(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.Rule
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	rule, err := services.EditRule(req)

	if err != nil {
		http.Error(w, "Failed to edit rule", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rule)
}
