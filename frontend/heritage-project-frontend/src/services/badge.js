import api from "./api";
import { Debug } from "../utils/debugLog";
import { ca } from "zod/v4/locales";
/**
 * create_course Creates a new course in the database.
 *
 * @NOTE:
 *  Backend handles authorizing user id and using it in the process of creating room entry
 * @create_badge_data :
 *  {
 *      "title": "Badge - fronchettineese Pronouns",
 *      "description": "Badge for learning the basics to the ancient language of fronchettinees",
 *      "icon": "image obj",
 *  }
 * @return:
 *  * HTTP 201 with course data if creation is successful.
 *  * HTTP 400 with validation errors if fields are invalid or missing.
 */
export async function create_badge(create_badge_data) {
	try {
		const response = await api.post(`website/create_badge/`, create_badge_data);
		Debug.log('badge creation successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}