

import type {Rule, RuleImage} from "../models/rule_mod"
import * as repo from "../repo/rules_repo"

//==============================================================================
// Adding Retrieving functions
//==============================================================================
export async function AddNewRule(rule: Rule) {
    const newrule = await repo.AddNewRule(rule)
    rule.id = newrule.id
    return rule;
}


//==============================================================================
// Rules Retrieving functions
//==============================================================================

export async function GetAllRules() {
    const rules = await repo.GetAllRules()
    const allRules: Rule[] =[]
    
    for (const ruleData of rules)
    {
        allRules.push(await FormatRule(ruleData.id, ruleData.title, ruleData.content, ruleData.editing_status));
    }
    return allRules;
}

export async function GetRuleByID(rule_id: string)
{
    const rule = await repo.GetRuleByID(rule_id)
    return FormatRule(rule.id, rule.title, rule.content, rule.editing_status);
}
//==============================================================================
// Rules Editing functions
//==============================================================================

export async function UpdateRule(rule: Rule): Promise<void> {
  await repo.UpdateRuleInfo(rule);

  const currentImages = await repo.GetAllRuleImages(rule.id);

  const currentIds = new Set(currentImages.map((img) => img.id));
  const newIds = new Set(rule.images.map((img) => img.id));

  // images to add: in rule.images but not in DB
  const imagesToAdd = rule.images.filter((img) => !currentIds.has(img.id));

  // images to delete: in DB but not in rule.images
  const imagesToDelete = currentImages.filter((img) => !newIds.has(img.id));

  await Promise.all([
    ...imagesToAdd.map((img) => repo.AddNewRuleImage(img, rule.id )),
    ...imagesToDelete.map((img) => repo.DeleteRuleImage(img.id)),
  ]);
}

//==============================================================================
// Rules Formating functions
//==============================================================================

async function FormatRule(rule_id: string, rule_title: string, rule_content: string, editing_status: string) 
{
    const images= await repo.GetAllRuleImages(rule_id)

    const soloRule: Rule = 
    {
        id: rule_id,
        title: rule_title,
        content: rule_content,
        images: images,
        editing_status:  editing_status
    }
    return soloRule;
}

//==============================================================================
// Rule Deleting functions
//==============================================================================

export async function DeleteRule(rule: Rule) 
{
    rule.editing_status = "deleted";
    const data = await UpdateRule(rule);
    return data;
}