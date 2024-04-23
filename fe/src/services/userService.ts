import axiosClient from './axiosClient';

const userService = {
	login: (
		data: { email: string; password: string },
		options = {
			withCredentials: true
		}
	) => {
		return axiosClient.post('login', data, options);
	},

	logout: (
		options = {
			withCredentials: true
		}
	) => {
		return axiosClient.post('logout', {}, options);
	}
};

export default userService;
