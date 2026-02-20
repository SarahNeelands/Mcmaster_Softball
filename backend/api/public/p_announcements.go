package apiPublic

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

// helper to apply CORS headers
func applyCORS(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Vary", "Origin")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Preflight request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

// GET /announcements
func GetAllAnnouncements(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	announcements, err := services.GetAllAnnouncements()
	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(announcements)
}

// GET /announcements/active
func GetActiveAnnouncements(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	activeAnnouncements, err := services.GetActiveAnnouncements()
	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activeAnnouncements)
}

// GET /announcements/archived
func GetArchivedAnnouncements(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	archivedAnnouncements, err := services.GetArchivedAnnouncements()
	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(archivedAnnouncements)
}
