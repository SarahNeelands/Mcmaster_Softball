package apiPublic

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

func GetAllRules(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rules, err := services.GetAllRules()

	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rules)
}
