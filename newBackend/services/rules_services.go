package services

import (
	"backend/models"
	"backend/repo"

	"errors"

	"github.com/google/uuid"
)

func GetAllRules() ([]models.Rule, error) {
	return repo.GetRules()
}

func CreateRule(title string, description string, images []models.RuleImage) (models.Rule, error) {
	id := uuid.NewString()
	newRule := models.Rule{
		ID:          id,
		Title:       title,
		Description: description,
		Images:      images,
	}
	rule, err := repo.AddNewRule(newRule)
	if err != nil {
		return models.Rule{}, err
	}
	return rule, nil
}

func DeleteRule(ruleID string) (models.Rule, error) {
	return repo.DeleteRule(ruleID)
}

func EditRule(updatedRule models.Rule) (models.Rule, error) {
	if updatedRule.ID == "" {
		return updatedRule, errors.New("cant edit a rule without an ID")
	}
	oldRule, err := repo.GetRuleByID(updatedRule.ID)
	if err != nil {
		return updatedRule, err
	}
	if updatedRule.Title != "" {
		oldRule.Title = updatedRule.Title

	}
	if updatedRule.Description != "" {
		oldRule.Description = updatedRule.Description
	}
	if updatedRule.Images != nil {
		oldRule.Images = updatedRule.Images
	}
	return repo.UpdateRule(oldRule)
}
