package main

import (
	api "backend/api"
	adminAPI "backend/api/admin"
	publicAPI "backend/api/public"
	"log"
	"net/http"
)

func main() {
	log.Println("Starting server on :8080")
	http.HandleFunc("/announcements", publicAPI.GetAllAnnouncements)
	http.HandleFunc("/announcements/active", publicAPI.GetActiveAnnouncements)
	http.HandleFunc("/announcements/archived", publicAPI.GetArchivedAnnouncements)

	http.HandleFunc("/announcements/create", adminAPI.AddNewAnnouncement)
	http.HandleFunc("/announcements/edit", adminAPI.EditAnnouncement)

	http.HandleFunc("/matches/upcoming", publicAPI.GetUpcomingMatches)
	http.HandleFunc("/matches/previous", publicAPI.GetPreviousMatches)

	http.HandleFunc("/matches/update", adminAPI.UpdateMatch)
	http.HandleFunc("/matches/team", publicAPI.GetMatchesByTeam)
	http.HandleFunc("/matches/delete", adminAPI.DeleteMatch)
	http.HandleFunc("/matches/create", adminAPI.CreateNewMatch)
	http.HandleFunc("/matches/schedule", adminAPI.ChangeSchedule)

	http.HandleFunc("/publish", adminAPI.Publish)
	http.HandleFunc("/rules", publicAPI.GetAllRules)
	http.HandleFunc("/rules/edit", adminAPI.EditRule)
	http.HandleFunc("/rules/add", adminAPI.AddNewRule)
	http.HandleFunc("/rules/delete", adminAPI.DeleteRule)

	http.HandleFunc("/teams", publicAPI.GetAllTeams)
	http.HandleFunc("/teams/add", adminAPI.AddNewTeam)
	http.HandleFunc("/teams/delete", adminAPI.DeleteTeam)
	http.HandleFunc("/teams/update", adminAPI.UpdateTeam)
	http.HandleFunc("/teams/get", publicAPI.GetTeamByID)

	http.HandleFunc("/teams/getBySlug", publicAPI.GetTeamBySlug)

	http.HandleFunc("/teams/getByDivision", publicAPI.GetTeamsByDivisionID)
	http.HandleFunc("/teams/getCurrentSeason", publicAPI.GetCurrentSeason)
	http.HandleFunc("/teams/getCurrentSeasonSeries", publicAPI.GetCurrentSeasonSeries)

	err := http.ListenAndServe(":8080", api.CorsMiddleware(http.DefaultServeMux))

	if err != nil {
		log.Fatal(err)
	}

}
