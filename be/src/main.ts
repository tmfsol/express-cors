import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import session from 'express-session';
import fs from 'fs';
import https from 'https';
import path from 'path';

import connectMongoDB, { store } from '~/common/connectMongoDB';
import { getEnv } from '~/configs';
import { type AppSessionData } from '~/types';

export const fakeDatabase = {
	users: [
		{
			id: 1,
			email: 'tandm160797@gmail.com',
			password: '111111',
		},
		{
			id: 2,
			email: 'tdm.tmfsol@gmail.com',
			password: '111111',
		},
	],
};

const bootstrap = async () => {
	const app = express();

	// Set static file folder
	app.use(express.static(path.join(path.resolve(), 'public')));

	// Set middlewares
	app.use(
		cors({
			origin: 'http://localhost:5173',
			credentials: true,
		}),
	);
	app.use(express.json()); // handle for req.body by application/json
	app.use(cookieParser(getEnv('COOKIE_SECRET_KEY')));

	app.use(
		session({
			store,
			name: 'sessionId',
			secret: getEnv('COOKIE_SECRET_KEY'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				signed: true,
				secure: true,
				httpOnly: true,
				maxAge: 15 * 60 * 1000,
				partitioned: true,
				sameSite: 'none',
			},
		}),
	);

	// Routes
	app.post('/login', (req: Request, res: Response) => {
		const { email, password } = req.body;
		const user = fakeDatabase.users.find((user) => {
			return user.email === email && user.password === password;
		});

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized!' });
		}

		(req.session as AppSessionData).sub = { userId: user.id };
		req.session.save();

		return res.status(200).json({
			message: 'Login successfully!',
			data: user,
		});
	});

	app.get('/me', (req: Request, res: Response) => {
		const { sessionId } = req.signedCookies;

		if (!sessionId) {
			return res.status(401).json({ message: 'Unauthorized!' });
		}

		store.get(sessionId as string, (err: any, session: AppSessionData) => {
			if (err || !session) {
				return res.status(401).json({ message: 'Unauthorized!' });
			}

			const user = fakeDatabase.users.find((user) => {
				return user.id === session.sub?.userId;
			});

			if (!user) {
				return res.status(401).json({ message: 'Unauthorized!' });
			}

			return res.status(200).json({
				message: 'Login successfully!',
				data: user,
			});
		});
	});

	app.post('/logout', (req: Request, res: Response) => {
		const { sessionId } = req.signedCookies;

		if (!sessionId) {
			return res.status(401).json({ message: 'Unauthorized!' });
		}

		store.destroy(sessionId as string, (err: any) => {
			if (!err) {
				res.clearCookie('sessionId', {
					signed: true,
					secure: true,
					httpOnly: true,
					partitioned: true,
					sameSite: 'none',
				});
				return res.status(200).json({ message: 'Logout successfully!' });
			}
			return res.status(401).json({ message: 'Unauthorized!' });
		});
	});

	// Setup MongoDB
	await connectMongoDB();

	// Start app in port
	https
		.createServer(
			{
				key: fs.readFileSync('./../be/tmfsol.dev-key.pem'),
				cert: fs.readFileSync('./../be/tmfsol.dev.pem'),
			},
			app,
		)
		.listen(3000, () => {
			console.log('App listening at port 3000');
		});
};

void bootstrap();
