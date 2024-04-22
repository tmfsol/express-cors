import colors from 'colors';
import MongoStore from 'connect-mongo';
import Mongoose from 'mongoose';

import { getEnv } from '~/configs';
import { isDevelopment } from '~/utils';

const connectMongoDB = async () => {
	try {
		if (isDevelopment) {
			Mongoose.set('debug', (coll, method, query) => {
				console.log(
					`${colors.green('Mongoose: ')}${colors.yellow(coll)}.${colors.cyan(method)}(${JSON.stringify(
						query,
						null,
						2,
					)});`,
				);
			});
		}
		await Mongoose.connect(getEnv('MONGODB_URI'));
		console.log(colors.green('Connect to MongoDB successfully!'));
	} catch (err) {
		console.log(colors.red('Connect to MongoDB failure!!!'));
	}
};

export const store = MongoStore.create({ mongoUrl: getEnv('MONGODB_URI') });

export default connectMongoDB;
