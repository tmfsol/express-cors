declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production';

		// Cookies
		COOKIE_SECRET_KEY: string;

		// Session
		SESSION_SECRET_KEY: string;

		// MongoDB
		MONGODB_URI: string;
	}
}
