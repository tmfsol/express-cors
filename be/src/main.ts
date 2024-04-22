import colors from 'colors';
import cookieParser from 'cookie-parser';
import express, { type Request, type Response } from 'express';
import session from 'express-session';
import path from 'path';

import connectMongoDB, { store } from '~/common/connectMongoDB';
import { getEnv } from '~/configs';
import { type AppSessionData } from '~/types';
import { defaultCookieOptions } from '~/utils/cookie';

export const database = {
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

	// Set EJS view engine
	app.set('view engine', 'ejs');
	app.set('views', path.join(path.resolve(), './src/views'));

	// Set static file folder
	app.use(express.static(path.join(path.resolve(), 'public')));

	// Set middlewares
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser(getEnv('COOKIE_SECRET_KEY')));

	app.use(
		session({
			store,
			secret: getEnv('SESSION_SECRET_KEY'),
			resave: false,
			saveUninitialized: false,
			cookie: defaultCookieOptions,
		}),
	);

	// Setup MongoDB
	await connectMongoDB();

	// EJS routes
	// Home routes
	app.get('/', (req: Request, res: Response) => {
		res.render('index');
	});

	// Auth routes
	app.get('/login', (req: Request, res: Response) => {
		if (!req.signedCookies.sessionId) {
			res.render('auth/login');
			return;
		}

		store.get(req.signedCookies.sessionId as string, (err: any, session: AppSessionData) => {
			if (err || !session) {
				res.render('auth/login');
				return;
			}

			const user = database.users.find((user) => {
				return user.id === session.userId;
			});

			if (!user) {
				res.render('auth/login');
				return;
			}

			res.redirect('dashboard');
		});
	});

	app.post('/login', (req: Request, res: Response) => {
		const { email, password } = req.body;
		const user = database.users.find((user) => {
			return user.email === email && user.password === password;
		});

		if (!user) {
			res.redirect('login');
			return;
		}

		(req.session as AppSessionData).userId = user.id;
		req.session.save((err: any) => {
			if (!err) {
				console.log(colors.green('Saved sessionId sucessfully!'));
			}
		});
		res.cookie('sessionId', req.sessionID, defaultCookieOptions);
		res.redirect('dashboard');
	});

	app.get('/logout', (req: Request, res: Response) => {
		if (!req.signedCookies.sessionId) {
			res.render('auth/login');
			return;
		}

		store.destroy(req.signedCookies.sessionId as string, (err: any) => {
			if (!err) {
				console.log(colors.green('Destroy sessionId sucessfully!'));
			}
		});

		res.cookie('sessionId', '', { expires: new Date(Date.now() - 1) });
		res.redirect('login');
	});

	// Dashboard routes
	app.get('/dashboard', (req: Request, res: Response) => {
		if (!req.signedCookies.sessionId) {
			res.redirect('login');
			return;
		}

		store.get(req.signedCookies.sessionId as string, (err: any, session: AppSessionData) => {
			console.log(req.signedCookies.sessionId, err, session);

			if (err || !session) {
				res.redirect('login');
				return;
			}

			const user = database.users.find((user) => {
				return user.id === session.userId;
			});

			if (!user) {
				res.redirect('login');
				return;
			}

			res.render('dashboard', { user });
		});
	});

	// Start app in port
	app.listen(3000, () => {
		console.log('App listening at port 3000');
	});
};

void bootstrap();
