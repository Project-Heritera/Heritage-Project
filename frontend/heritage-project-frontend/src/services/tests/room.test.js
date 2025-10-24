import { publish_room } from "../room"


const test_badge = new Image(image_path);
test_badge.sec = "frontend\heritage-project-frontend\src\assets\course_image_placeholder_1.png" 
test_json = {
	title: "test title",
	description: "test description",
	tags: ["tag1" ,"tag2"],
	badge_title: "badgetitle",
	badge_icon: test_badge,
}
const result = publish_room(1, 1, 1, test_json)