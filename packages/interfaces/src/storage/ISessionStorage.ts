/**
 * Interface for storing and retrieving session state
 * Allows connection layer to persist session state (cookies, CSRF token) externally
 */
import type { ISessionState } from './ISessionState';

export interface ISessionStorage {
  /**
   * Save session state for a given session ID
   * @param sessionId - Unique session identifier
   * @param state - Session state to save
   */
  save(sessionId: string, state: ISessionState): Promise<void>;

  /**
   * Load session state for a given session ID
   * @param sessionId - Unique session identifier
   * @returns Session state or null if not found
   */
  load(sessionId: string): Promise<ISessionState | null>;

  /**
   * Delete session state for a given session ID
   * @param sessionId - Unique session identifier
   */
  delete(sessionId: string): Promise<void>;
}
