import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL_FOR_TEST;

/**
 * create_room: Creates a new room in the database.
 *
 * @NOTE:
 *  Backend handles authorizing user id and using it in the process of creating room entry
 * @create_room_data :
 *  {
 *      "title": "Learn fronchettineese basics - Pronouns",
 *      "description": "Room for learning the basics to the ancient language of fronchettinees",
 *  }
 * @return:
 *  * HTTP 201 with room data if creation is successful.
 *  * HTTP 400 with validation errors if fields are invalid or missing.
 */
export async function create_room(create_room_data) {
	try {
		const response = await axios.post(`${BASE_URL}/rooms/create_room/`, create_room_data);
		Debug.log('room create successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

/**
 * get_room_data: Fetches details for a specific room.
 * @ NOTE: backend handles verification of it user can access room
 * @room_id :
 *  ID of room to seek data fromNone (room_id is provided as a URL parameter)
 * @return:
 *  * HTTP 200 with full room data if found.
 *  * HTTP 404 if the room ID does not exist.
 */
export async function get_room_data(room_id) {
	try {
		const response = await axios.get(`${BASE_URL}/rooms/${room_id}/`);
		Debug.log('room fetch successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

/**
 * save_room: Overwrites room data with new data. Used for editing room
 * @room_id :
 *  ID of room to seek data fromNone (room_id is provided as a URL parameter)
 * @new_room_data :
 *  {
 *    todo: add json layout here
 *  }
 *
 * @return:
 *  * HTTP 200 with updated room data if successful.
 *  * HTTP 400 with validation errors if update fails.
 */
export async function save_room(room_id, new_room_data) {
	try {
		const response = await axios.post(`${BASE_URL}/rooms/${room_id}/`, new_room_data);
		Debug.log('room save successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

/**
 * publish_room: Publishes a room once its complete (makes it visible or active).
 * @room_id :
 *  ID of room to seek data fromNone (room_id is provided as a URL parameter)
 * @publish_room_data :
 *  {
 *      "visibility_level": public
 * 		"access_users": [] //list of ids for users allowed to see if visiblity level is limited
 *  }
 * @return:
 *  * HTTP 200 if the room was published successfully.
 *  * HTTP 400 or 403 if the user lacks permission or the request is invalid.
 */
export async function publish_room(room_id, publish_room_data) {
	try {
		const response = await axios.post(`${BASE_URL}/rooms/${room_id}/publish`,publish_data);
		Debug.log('room save successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

export async function get_test_room(){
	//for testing purposes
	test_room  = {
		"course_id": 1,
		"section_id": 12,
		"room_id": 123,
		"title": "Example Test room",
		"description": "This is just an example room malik is using to terst his algorithsm for requesting and parsing the room data",
		"creator": 69,
		"editing_mode": true,
		"number_of_problems": 2,
		"metadata" : {
			"tasks": [
				{
					"task_id": 2321,
					"pointValue": 1,
					"tags": ["tag1", "tag2"],
					"task_components": [
						{
							"task_component_id": 432,
							"type": "text",
							"data": { "text": "this is text data to display" }
						},
						{
							"task_component_id": 43212,
							"type": "mcq",
							"data": { "...": "..." }
						}
					]
				},
				{
					"task_id": 2121,
					"pointValue": 0,
					"tags": [],
					"task_components": [
						{
							"task_component_id": 41232,
							"type": "text",
							"data": { "text": "text for question 2" }
						}
					]
				}
			]
		},
		"created_on": "10-9-25",
		"last_updated": "10-9-25", 
	}
	return test_room;
}