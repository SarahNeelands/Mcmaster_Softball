package models

type Match struct {
	ID            string `json:"id"`
	Date          string `json:"date"`
	Time          string `json:"time"`
	HomeTeam      string `json:"homeTeam"`
	AwayTeam      string `json:"awayTeam"`
	Field         string `json:"field"`
	HomeScore     int    `json:"homeScore"`
	AwayScore     int    `json:"awayScore"`
	EditingStatus string `json:"editingStatus"`
}

type Game struct {
	ID       string `json:"id"`
	HomeTeam string `json:"homeTeam"`
	AwayTeam string `json:"awayTeam"`
	Field    string `json:"field"`
}

type TimeBlock struct {
	Time  string `json:"time"`
	Games []Game `json:"games"`
}

type ScheduleDay struct {
	Date       string      `json:"date"`
	TimeBlocks []TimeBlock `json:"timeBlocks"`
}
