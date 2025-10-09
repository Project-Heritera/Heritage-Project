import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL_FOR_TEST;


/**
 * login: Send requst to Authenticates a user given their credentials.
 * @login_data : 
 *  {
 *      "username": "existing_user123",
 *      "password": "securepassword"
 *  }
 *
 * @return:
 *  * HTTP 200 with user data and authentication token if login is successful.
 *  * HTTP 400 or 401 with error details if credentials are invalid or missing.
 */
export async function login(login_data) {
	try {
		const response = await axios.post(`${BASE_URL}/accounts/login_user/`, login_data);
		console.log('Login successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}