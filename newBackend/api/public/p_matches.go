package apiPublic

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

func GetUpcomingMatches(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	upcomingMatches, err := services.GetUpcomingMatches()
	if err != nil {
		http.Error(w, "Failed to fetch upcoming matches", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(upcomingMatches)
}

func GetPreviousMatches(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	previousMatches, err := services.GetPreviousMatches()
	if err != nil {
		http.Error(w, "Failed to fetch previous matches", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(previousMatches)
}

func GetMatchesByTeam(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	team := r.URL.Query().Get("team")
	matches, err := services.GetMatchesByTeam(team)
	if err != nil {
		http.Error(w, "Failed to fetch upcoming matches", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}
