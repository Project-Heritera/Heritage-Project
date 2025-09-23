import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL_FOR_TEST;



export async function login(username, password) {
	try {
		const response = await axios.post(`${BASE_URL}/accounts/login_user/`, {
			 username,
			 password
		});
		console.log('Login successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}