import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL_FOR_TEST;



export async function login(username, password) {
	try {
		//Attempt to request tokens from backend
		const response = await axios.post(`${BASE_URL}/accounts/token/`, {
			 username,
			 password
		});

		//Check and store access token and refresh token
		if (response.data && response.data.access && response.data.refresh) {
			//Store to local storage
			localStorage.setItem('ACCESS_TOKEN', response.data.access);
			localStorage.setItem('REFRESH_TOKEN', response.data.refresh);
		}
		console.log('Login successful', response.data);
		return response.data
	} 
	catch (error) {
		//Requests in try failed default to here
		throw(error);
	}
}