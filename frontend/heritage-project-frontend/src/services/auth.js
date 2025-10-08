import api from './api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../services/LocalStorage'; 

//This function/service handles login requests for JWT tokens during a login attempt. Requires input of username and password of user.
//Tokens are stored in local storage.
export async function login(username, password) {
	try {
		//Attempt to request tokens from backend
		const response = await api.post(`/accounts/token/`, {
			 username,
			 password
		});

		//Check and store access token and refresh token
		if (response.data && response.data.access && response.data.refresh) {
			//Store to local storage
			localStorage.setItem(ACCESS_TOKEN, response.data.access);
			localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
		}
		console.log('Login successful', response.data);
		return response.data
	} 
	catch (error) {
		//Requests in try failed default to here
		throw(error);
	}
}