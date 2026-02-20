package apiPublic

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

func GetAllTeams(w http.ResponseWriter, r *http.Request) {

	teams, err := services.GetAllTeams()
	if err != nil {
		http.Error(w, "Failed to fetch teams", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

func GetTeamByID(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := r.URL.Query().Get("id")
	team, err := services.GetTeamByID(id)
	if err != nil {
		http.Error(w, "Failed to fetch team", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}

func GetTeamBySlug(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	slug := r.URL.Query().Get("slug")
	team, err := services.GetTeamBySlug(slug)
	if err != nil {
		http.Error(w, "Failed to fetch team", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}
