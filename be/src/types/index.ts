import { type SessionData } from 'express-session';

export interface AppSessionData extends SessionData {
	sub?: { userId: number };
}
