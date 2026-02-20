package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
)

func GetAnnouncements() ([]models.Announcement, error) {
	return mock.Announcements, nil
}

func AddNewAnnouncement(announcement models.Announcement) (models.Announcement, error) {
	if announcement.ID == "" {
		return models.Announcement{}, errors.New("announcement must have an ID")
	}

	mock.Announcements = append(mock.Announcements, announcement)
	return announcement, nil
}

func GetAnnouncementByID(id string) (models.Announcement, error) {
	for _, announcement := range mock.Announcements {
		if announcement.ID == id {
			return announcement, nil
		}
	}
	return models.Announcement{}, errors.New("announcement not found")
}

func UpdateAnnouncement(update models.Announcement) (models.Announcement, error) {
	for i, announcement := range mock.Announcements {
		if announcement.ID == update.ID {
			mock.Announcements[i] = update
			return update, nil
		}
	}
	return models.Announcement{}, errors.New("announcement not updated")
}
