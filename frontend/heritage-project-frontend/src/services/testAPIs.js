// Used to test the backend APIs, can discard when merging
import api from "./api";

export async function test_api() {
	try {
        const test_input = {
            "status": "NOSTAR",
            "attempts": 0,
            "metadata": {
                "struggling_with": "time complexity"
            }
        }
		const response = await api.put(`website/tasks/1/update_progress/`, test_input); //enter url here
        console.log("response from call:", response)
		return response.data
	}   
	catch (error) {
		throw(error);
	}
}