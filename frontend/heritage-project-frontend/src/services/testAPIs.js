// Used to test the backend APIs, can discard when merging
import api from "./api";

export async function test_api() {
	try {
        const test_input = {
            "title": "AI slop assignment 1",
            "description": "A beginner-level room."
        }
        let course_id = 1
        let section_id = 1
		const response = await api.post(`website/courses/${course_id}/sections/${section_id}/create_room/`, test_input); //enter url here
        console.log("response from call:", response)
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}