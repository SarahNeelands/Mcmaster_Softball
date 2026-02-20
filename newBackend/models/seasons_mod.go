package models

type Season struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Series   []Series `json:"series"`
	IsActive bool     `json:"isActive"`
}

type Series struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	StartDate      string     `json:"startDate"`
	EndDate        string     `json:"endDate"`
	Divisions      []Division `json:"divisions"`
	MoveUpAmount   int        `json:"moveUpAmount"`
	MoveDownAmount int        `json:"moveDownAmount"`
	IsActive       bool       `json:"isActive"`
}

type Division struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Slug       string     `json:"slug"`
	WinPoints  int        `json:"winPoints"`
	LossPoints int        `json:"lossPoints"`
	TiePoints  int        `json:"tiePoints"`
	TeamIDs    []string   `json:"teamIDs"`
	Standings  []Standing `json:"standings"`
}

type Standing struct {
	TeamID string `json:"teamID"`
	Wins   int    `json:"wins"`
	Losses int    `json:"losses"`
	Ties   int    `json:"ties"`
	Points int    `json:"points"`
}
