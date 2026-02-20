package mock

import "backend/models"

var Teams = []models.Team{
	{
		ID:             "team-engineering-eagles",
		Slug:           "engineering-eagles",
		Name:           "Engineering Eagles",
		CaptainName:    "Alex Turner",
		CaptainEmail:   "alex.turner@eng.example.edu",
		CoCaptainName:  "Jamie Chen",
		CoCaptainEmail: "jamie.chen@eng.example.edu",
	},
	{
		ID:             "team-medical-mustangs",
		Slug:           "medical-mustangs",
		Name:           "Medical Mustangs",
		CaptainName:    "Priya Patel",
		CaptainEmail:   "priya.patel@med.example.edu",
		CoCaptainName:  "Samir Khan",
		CoCaptainEmail: "samir.khan@med.example.edu",
	},
	{
		ID:             "team-science-sluggers",
		Slug:           "science-sluggers",
		Name:           "Science Sluggers",
		CaptainName:    "Taylor Brooks",
		CaptainEmail:   "taylor.brooks@sci.example.edu",
		CoCaptainName:  "Morgan Diaz",
		CoCaptainEmail: "morgan.diaz@sci.example.edu",
	},
	{
		ID:             "team-arts-aces",
		Slug:           "arts-aces",
		Name:           "Arts Aces",
		CaptainName:    "Riley Johnson",
		CaptainEmail:   "riley.johnson@arts.example.edu",
		CoCaptainName:  "Jordan Lee",
		CoCaptainEmail: "jordan.lee@arts.example.edu",
	},
	{
		ID:             "team-business-bears",
		Slug:           "business-bears",
		Name:           "Business Bears",
		CaptainName:    "Casey Morgan",
		CaptainEmail:   "casey.morgan@biz.example.edu",
		CoCaptainName:  "Avery Ross",
		CoCaptainEmail: "avery.ross@biz.example.edu",
	},
	{
		ID:             "team-health-hawks",
		Slug:           "health-hawks",
		Name:           "Health Hawks",
		CaptainName:    "Jordan Davis",
		CaptainEmail:   "jordan.davis@health.example.edu",
		CoCaptainName:  "Lee Parker",
		CoCaptainEmail: "lee.parker@health.example.edu",
	},
}
