// Offline queue — persists pending API payloads in localStorage so they can
// be replayed once the device comes back online.

const QUEUE_KEY = 'maechaem_offline_queue';

export interface PendingAction {
  id: string;
  timestamp: number;
  payload: any;
  description: string;
}

/** Return all queued actions (oldest first). */
export function getPendingActions(): PendingAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Add a new action to the queue and return its id. */
export function addPendingAction(payload: any, description: string): string {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const actions = getPendingActions();
  actions.push({ id, timestamp: Date.now(), payload, description });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
  return id;
}

/** Remove a single action from the queue (e.g. after a successful sync). */
export function removePendingAction(id: string): void {
  const actions = getPendingActions().filter((a) => a.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
}

/** Number of items currently waiting to be synced. */
export function getPendingCount(): number {
  return getPendingActions().length;
}
