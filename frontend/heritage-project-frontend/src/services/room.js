import api from "./api";
import { Debug } from "../utils/debugLog";
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
		const response = await api.post(`website/courses/${course_id}/sections/${section_id}/create_room/`, create_room_data);
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
export async function get_room_data(course_id, section_id, room_id) {
	try {
		const response = await api.get(`website/courses/${course_id}/sections/${section_id}/rooms/${room_id}/`);
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
 *{
   "can_edit": true,
   "title": "Analyzing Fronchetti Behaviors",
    "description": "Dive deep into the mysterious habits, gestures, and vocal inflections of Professor Fronchetti. From his signature “hmm” of approval to the legendary mid-lecture coffee sip, this section helps students recognize, interpret, and perhaps even predict",
    "metadata": {},
    "visibility": "PRI",
    "is_published": false,
    "tasks": [],
    "creator": "mmalik",
    "created_on": "2025-10-13T02:24:27.838625Z",
    "last_updated": "2025-10-13T02:24:27.838625Z"
} 
 *
 * @return:
 *  * HTTP 200 with updated room data if successful.
 *  * HTTP 400 with validation errors if update fails.
 */
export async function save_room(course_id, section_id, room_id, new_room_data) {
	try {
		const response = await api.post(`website/courses/${course_id}/sections/${section_id}/rooms/${room_id}/save/`, new_room_data);
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
export async function publish_room(course_id, section_id, room_id, publish_room_data) {
	try {
		const response = await api.post(`website/courses/${course_id}/sections/${section_id}/rooms/${room_id}/publish`,publish_data);
		Debug.log('room save successful', response.data);
		return response.data
	} 
	catch (error) {
		throw(error);
	}
}

export async function get_test_room(){
	//for testing purposes
	const test_room  = {
		"course_id": 1,
		"section_id": 12,
		"room_id": 123,
		"access_users":[],
		"can_edit": true,
		"title": "Example Test room",
		"description": "This is just an example room malik is using to terst his algorithsm for requesting and parsing the room data",
		"metadata": {},
		"visibility": "PRI",
		"is_published":false,
		"tasks": [
			{
				"task_id": 2321,
				"pointValue": 1,
				"tags": ["tag1", "tag2"],
				"task_components": [
					{
						"task_component_id": 432,
						"type": "TEXT",
						"metadata": { "text": "this is text data to display" }
					},
					{
						"task_component_id": 43212,
						"type": "MCQ",
						"metadata": { "text": "" }
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
						"type": "TEXT",
						"metadata": { "text": "text for question 2" }
					}
				]
			}
		],
		"creator": "test_user",
		"created_on": "10-9-25",
		"last_updated": "10-9-25", 
	}
	return test_room;
}