package mock

import (
	"backend/models"
)

var Announcements = []models.Announcement{
	{
		ID:    "announcement-1",
		Title: "Season Kickoff",
		Content: "Join us at the opening ceremony this Saturday at Alumni Field. " +
			"Captains meeting begins at 9:30 AM.",
		Date:     "2024-04-15",
		Archived: false,
	},
	{
		ID:    "announcement-2",
		Title: "Roster Finalization",
		Content: "Team rosters are due by Friday evening. Submit updates through " +
			"the admin portal to finalize player eligibility.",
		Date:     "2024-04-12",
		Archived: false,
	},
	{
		ID:    "announcement-3",
		Title: "Equipment Pickup",
		Content: "Coaches can pick up league-approved bats and helmets from the " +
			"equipment room between 2 PM and 5 PM.",
		Date:     "2024-04-10",
		Archived: true,
	},
}
