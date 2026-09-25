import { getPool } from './pool.js';

// Records one row in project_events. Never throws into the caller's request
// handler -- an audit-log write failing shouldn't fail the whole action.
export async function logEvent({ projectId, actorId = null, eventType, fromStatus = null, toStatus = null, details = {} }) {
  try {
    await getPool().query(
      `INSERT INTO project_events (project_id, actor_id, event_type, from_status, to_status, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [projectId, actorId, eventType, fromStatus, toStatus, JSON.stringify(details)]
    );
  } catch (error) {
    console.error(`Failed to log event "${eventType}" for project ${projectId}:`, error.message);
  }
}
