package apiPublic

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

func GetCurrentSeason(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	season, err := services.GetCurrentSeason()
	if err != nil {
		http.Error(w, "Failed to fetch season", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(season)
}

func GetAllSeasons(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	seasons, err := services.GetAllSeasons()
	if err != nil {
		http.Error(w, "Failed to fetch seasons", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(seasons)
}

func GetCurrentSeasonSeries(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	series, err := services.GetCurrentSeasonSeries()
	if err != nil {
		http.Error(w, "Failed to fetch series", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(series)
}

func GetTeamsByDivisionID(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	division := r.URL.Query().Get("division")
	teams, err := services.GetTeamsByDivisionID(division)
	if err != nil {
		http.Error(w, "Failed to fetch upcoming matches", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}
