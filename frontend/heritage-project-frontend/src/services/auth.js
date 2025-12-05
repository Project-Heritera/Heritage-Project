import api from './api'
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_NAME } from '../services/LocalStorage';

//This function/service handles login requests for JWT tokens during a login attempt. Requires input of username and password of user.
//Tokens are stored in local storage.
export async function login(username, password, authResponse) {
	try {
		//Attempt to request tokens from backend
		let response = null
		if (authResponse) {
			response = authResponse
		} else {
			console.log("Using default login")
			response = await api.post(`/accounts/login_step1/`, {
				username,
				password
			});
		}

		if (response.data.mfa_required) {
			return response.data
		}

		//Check and store access token and refresh token
		if (response.data && response.data.access && response.data.refresh) {
			//Store to local storage
			localStorage.setItem(ACCESS_TOKEN, response.data.access);
			localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
		}

		localStorage.setItem(USER_NAME, username);
		console.log('Login successful', response.data);
		return response.data
	}
	catch (error) {
		if (error.response) {
			throw { status: error.response.status, data: error.response.data };
		}
		else if (error.request) {
			throw { status: null, data: null, message: 'No response received from server' };
		}
		else {
			throw { status: null, data: null, message: error.message };
		}
	}
}
