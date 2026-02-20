package models

type Announcement struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Date     string `json:"date"`
	Archived bool   `json:"archived"`
}
