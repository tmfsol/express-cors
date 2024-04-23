import axios from 'axios';

const axiosClient = axios.create({
	headers: {
		'Content-Type': 'application/json'
	},
	baseURL: import.meta.env.VITE_BASE_URL
});

export default axiosClient;
