// Used to test the backend APIs, can discard when merging
import api from "./api";

export async function test_api() {
	try {
        const test_input = {
            "title": "AI course 1",
            "description": "A beginner-level course."
        }
        let course_id = 1
        let section_id = 1
		const response = await api.get(`website/courses/2/progress/`); //enter url here
        console.log("response from call:", response)
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}