
/*
  Repo Functions' for Rules
  = GetRules()
    - returns all rules in descending order
  = GetRuleByID(id)
    - returns a rule by id
  = AddNewRule(rule)
    - adds a new rule to the database
  = UpdateRuleInfo(update)
    - updates a rule in the database
  = UpdateRuleImages(update)
    - updates a rule image in the database
  = DeleteRule()
    - deletes all rules with editing_status = 'deleted'
*/

import { pool } from "../database/db";
import { Rule, RuleImage } from "../models/rule_mod";

//==============================================================================
// Rules GET functions
//==============================================================================


export async function GetAllRules() 
{
  const {rows} = await pool.query(
    ` SELECT * FROM rules`);
  return rows;
}

export async function GetRuleByID(id: string)
{
  const {rows} = await pool.query(
    `SELECT * 
    FROM rules
    WHERE  id = $1`);
    if (rows.length === 0) {throw new Error(`Rule not found: ${id}`);}
    return rows;
}


//==============================================================================
// Rules ADD functions
//==============================================================================

export async function AddNewRule(rule: Rule)
{
  const {rows} = await pool.query(
    `INSERT INTO rules (name, content)
    VALUES ($1, $2)
    RETURNING *`,
    [
      rule.name,
      rule.content
    ]
  );
  if (rows.length === 0) {throw new Error(`Rule not added: ${rule.name}`);}
  const ruleID = rows[0].id;
  for (const image of rule.images) {
    AddNewRuleImage(image, ruleID);
  }
  return rows;
}

export async function AddNewRuleImage(ruleImage: RuleImage, ruleID: string)
{
  const {rows} = await pool.query(
    `INSERT INTO rule_images (rule_id, src, alt)
    values ($1, $2, $3)
    RETURNING *`,
    [
      ruleID,
      ruleImage.src,
      ruleImage.alt
    ]);
    if (rows.length === 0) {throw new Error(`Rule image not added: ${ruleID}}`);}
  return rows;
}


//==============================================================================
// Rules UPDATE functions
//==============================================================================

export async function UpdateRuleInfo(update: Rule)
{
  const {rows} = await pool.query(
    `UPDATE rules
    SET
      name = $1,
      content = $2
    WHERE id = $3
    RETURNING *
    `,
    [
      update.name,
      update.content,
      update.id
    ],);
  if (rows.length === 0) {throw new Error(`Rule not found: ${update.id}`);}
  return rows;
}

export async function UpdateRuleImages(update: RuleImage)
{
  const {rows} = await pool.query(
    `UPDATE rules
    SET
      src = $2
      alt = $3
    WHERE id = $1
    RETURNING *`,
    [update.id, update.src, update.alt]
  );
  if (rows.length ===0) {throw new Error(`Rule not found: ${update.id}`);}
  return rows;
}



//==============================================================================
// Rules DELETE functions
//==============================================================================

export async function DeleteRule()
{
  const {rows} = await pool.query(
  `DELETE FROM rules WHERE editing_status =  'deleted'
  RETURNING *`);
  return rows;
}