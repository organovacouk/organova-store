import { db } from "./db";
// Simple counters kept in the settings table. Returns the new count for this key.
export async function bump(key) {
  return parseInt((await db().prepare("INSERT INTO settings (key,value) VALUES (?,'1') ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+1 RETURNING value").bind(key).first()).value);
}
