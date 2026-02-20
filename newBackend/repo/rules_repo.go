package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
)

func GetRules() ([]models.Rule, error) {
	return mock.Rules, nil
}

func AddNewRule(rule models.Rule) (models.Rule, error) {
	if rule.ID == "" {
		return models.Rule{}, errors.New("rule must have an ID")
	}
	mock.Rules = append(mock.Rules, rule)
	return rule, nil
}

func DeleteRule(ruleID string) (models.Rule, error) {
	for i, rule := range mock.Rules {
		if rule.ID == ruleID {
			// remove from slice
			mock.Rules = append(mock.Rules[:i], mock.Rules[i+1:]...)
			return rule, nil
		}
	}
	return models.Rule{}, errors.New("failed to remove rule")
}

func UpdateRule(updated models.Rule) (models.Rule, error) {
	for i, rule := range mock.Rules {
		if updated.ID == rule.ID {
			mock.Rules[i] = updated
			return updated, nil
		}
	}
	return updated, errors.New("rule not updated")
}

func GetRuleByID(id string) (models.Rule, error) {
	for _, rule := range mock.Rules {
		if rule.ID == id {
			return rule, nil
		}
	}
	return models.Rule{}, errors.New("cannot find a rule with that id")
}
