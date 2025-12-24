import api from "./api";

export async function get_n_to_m_headwords(n, m) {
	try {
		const response = await api.get(`dictionary/get_n_to_m_headwords/${n}/${m}`);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

export async function get_all_pos() {
	try {
		const response = await api.get(`dictionary/pos/`);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function get_all_sources() {
	try {
		const response = await api.get(`dictionary/sources/`);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function get_term_data(term) {
	try {
		const response = await api.get(`dictionary/headwords/${term}/data`);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function get_term_exact_data(term) {
	try {
		const response = await api.get(`dictionary/headwords/${term}/exact/data`);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function get_n_terms() {
	try {
		const response = await api.get(`dictionary/n_words/`);
		return response.data;
	} catch (error) {
		throw error;
	}
}
