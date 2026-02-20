/**
 * teams.ts
 * --------
 * Shared TypeScript types for teams, games, standings, and roster data.
 * Shapes mirror the planned Supabase tables to make swapping the mock data
 * provider for real queries a drop-in change.
 */

package models

type Team struct {
	ID             string `json:"id"`
	Slug           string `json:"slug"`
	Name           string `json:"name"`
	CaptainName    string `json:"captainName"`
	CaptainEmail   string `json:"captainEmail"`
	CoCaptainName  string `json:"coCaptainName"`
	CoCaptainEmail string `json:"coCaptainEmail"`
}
