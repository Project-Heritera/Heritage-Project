import api from "./api";
import { Debug } from "../utils/debugLog";
import { ca } from "zod/v4/locales";
/**
 * create_section Creates a new section in the database.
 *
 * @NOTE:
 *  Backend handles authorizing user id and using it in the process of creating room entry
 * @create_section_data :
 *  {
 *      "title": "Learn fronchettineese basics - Pronouns",
 *      "description": "section for learning the basics to the ancient language of fronchettinees",
 *  }
 * @return:
 *  * HTTP 201 with section data if creation is successful.
 *  * HTTP 400 with validation errors if fields are invalid or missing.
 */
export async function create_section(course_id, create_section_data) {
	try {
        const response = await api.post(`website/courses/${course_id}/create_section/`, create_section_data);
		Debug.log('section creation successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}
