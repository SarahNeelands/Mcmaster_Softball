package mock

import "backend/models"

// Rules is temporary seed data for league rules until DB/Supabase is wired up.
var Rules = []models.Rule{
	{
		ID:    "rule-1",
		Title: "Eligibility & Rosters",
		Description: "All participants must be current students, staff, or faculty with a valid McMaster ID. " +
			"Rosters are capped at 16 players and must include at least four players who identify as women. " +
			"Captains are responsible for submitting finalized rosters prior to opening day and confirming eligibility each week.",
		Images: []models.RuleImage{
			{
				ID:  "rule-1-image-1",
				Src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
				Alt: "Players huddled before a game",
			},
		},
	},
	{
		ID:    "rule-2",
		Title: "Gameplay & Mercy Rule",
		Description: "Games are seven innings or 70 minutes, whichever comes first. " +
			"Run limits are five per half inning, with the final inning open. " +
			"The mercy rule is triggered if a team leads by 12 or more runs after five innings. " +
			"If lightning is detected, play is suspended immediately and resumes only when the fields director clears the area.",
		Images: []models.RuleImage{
			{
				ID:  "rule-2-image-1",
				Src: "https://images.unsplash.com/photo-1516979187457-637abb4f9356?auto=format&fit=crop&w=600&q=80",
				Alt: "Batter hitting a softball",
			},
			{
				ID:  "rule-2-image-2",
				Src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
				Alt: "Scoreboard at dusk",
			},
		},
	},
	{
		ID:    "rule-3",
		Title: "Sportsmanship & Protests",
		Description: "Respect for opponents and umpires is mandatory. " +
			"Profanity, equipment throwing, or aggressive contact leads to immediate ejection. " +
			"Captains may file a formal protest within 24 hours by emailing the league director with inning, play description, and supporting media.",
		Images: []models.RuleImage{},
	},
}
