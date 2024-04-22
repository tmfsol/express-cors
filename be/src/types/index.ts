import { type SessionData } from 'express-session';

export interface AppSessionData extends SessionData {
	userId?: any;
}
