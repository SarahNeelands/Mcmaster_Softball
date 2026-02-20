package apiAdmin

import (
	"backend/models"
	"backend/services"
	"encoding/json"
	"net/http"
)

/* ---------------- UPDATE MATCH ---------------- */

func UpdateMatch(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.Match
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	match, err := services.UpdateMatch(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match)
}

/* ---------------- DELETE MATCH ---------------- */

func DeleteMatch(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	match, err := services.DeleteMatch(req.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match)
}

/* ---------------- CREATE MATCH ---------------- */

func CreateNewMatch(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.Match
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	match, err := services.CreateNewMatch(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match)
}

/* ---------------- CHANGE DAY SCHEDULE ---------------- */

func ChangeSchedule(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.ScheduleDay
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := services.ChangeDaySchedule(req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
