package apiAdmin

import (
	"backend/models"
	"backend/services"
	"encoding/json"
	"net/http"
)

// helper to apply CORS headers
func applyCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

type CreateAnnouncementRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	Date    string `json:"date"`
}

// GET /announcements
func AddNewAnnouncement(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateAnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	announcements, err := services.CreateAnnouncement(
		req.Title,
		req.Content,
		req.Date,
	)
	if err != nil {
		http.Error(w, "Failed to create announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(announcements)
}

func EditAnnouncement(w http.ResponseWriter, r *http.Request) {

	// allow preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.Announcement
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	announcements, err := services.EditAnnouncement(
		req.ID,
		req.Title,
		req.Content,
		req.Date,
		req.Archived,
	)
	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(announcements)
}
