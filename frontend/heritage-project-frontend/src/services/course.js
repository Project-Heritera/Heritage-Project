import api from "./api";
import { Debug } from "../utils/debugLog";
import { ca } from "zod/v4/locales";
/**
 * create_course Creates a new course in the database.
 *
 * @NOTE:
 *  Backend handles authorizing user id and using it in the process of creating room entry
 * @create_course_data :
 *  {
 *      "title": "Learn fronchettineese basics - Pronouns",
 *      "description": "Course for learning the basics to the ancient language of fronchettinees",
 *  }
 * @return:
 *  * HTTP 201 with course data if creation is successful.
 *  * HTTP 400 with validation errors if fields are invalid or missing.
 */
export async function create_course(create_course_data) {
	try {
		const response = await api.post(`website/courses/create_course/`, create_course_data);
		Debug.log('course creation successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}
