import dotenv from 'dotenv';
import path from 'path';

import { isDevelopment } from '~/utils';

// Config dotenv
export const getEnv = (key: string) => {
	return process.env[key] ?? '';
};

dotenv.config({ path: path.join(path.resolve(), isDevelopment ? '.env.development' : '.env.production') });
