package apiAdmin

import (
	"backend/models"
	"backend/services"
	"encoding/json"
	"net/http"
)

func UpdateTeam(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req models.Team
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	team, err := services.UpdateTeam(req)
	if err != nil {
		http.Error(w, "Failed to update team", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}

func AddNewTeam(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req models.Team
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	team, err := services.AddNewTeam(req)
	if err != nil {
		http.Error(w, "Failed to add team", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}

func DeleteTeam(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := r.URL.Query().Get("id")
	team, err := services.DeleteTeam(id)
	if err != nil {
		http.Error(w, "Failed to delete team", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}
