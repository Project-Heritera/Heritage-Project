import api from "./api";

export async function get_tags() {
	try {
		const response = await api.get(`website/tags/`);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}