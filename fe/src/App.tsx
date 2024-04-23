import { SyntheticEvent, useEffect, useState } from 'react';

import userService from './services/userService';
import axiosClient from './services/axiosClient';

const App = () => {
	const [fields, setFields] = useState({
		email: '',
		password: ''
	});

	const handleFieldsChange = (event: SyntheticEvent) => {
		const { name, value } = event.target as HTMLInputElement;
		setFields((previousState) => ({
			...previousState,
			[name]: value
		}));
	};

	const handleSubmit = async (event: SyntheticEvent) => {
		try {
			event.preventDefault();
			const { data } = await userService.login(fields);
			console.log(data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleLogout = () => {
		userService.logout();
	};

	useEffect(() => {
		axiosClient.get('me', { withCredentials: true });
	}, []);

	return (
		<div>
			<h3>App</h3>

			<form onSubmit={handleSubmit}>
				<label htmlFor="email">Email: </label>
				<input
					id="email"
					type="text"
					name="email"
					value={fields.email}
					onChange={handleFieldsChange}
				/>
				<br />

				<label htmlFor="password">Password: </label>
				<input
					id="password"
					type="password"
					name="password"
					value={fields.password}
					onChange={handleFieldsChange}
				/>
				<br />

				<button>Login</button>
			</form>

			<br />

			<button onClick={handleLogout}>Logout</button>
		</div>
	);
};

export default App;
