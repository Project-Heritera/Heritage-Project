import { useState } from "react";
import { List } from "lucide-react";
import "../styles/pages/course_view.css";
import { Button } from "@/components/ui/button";
import CourseCard from "../components/CourseViewer/CourseCard";
import PublicationForm from "@/components/PublicationForm";
import { useParams } from "react-router-dom";
import Modal from "@/components/Modal";

const CourseView = () => {
  const [courseCreationForm, setCourseCreationForm] = useState(false);
  const {user_id} = useParams();
  // Function to handle sign in
  async function loadUserCourses() {
    /*
    if (username && password){
      try {
        const data = await login(username, password);
        console.log("Login success:", data);
      } catch (error) {
        console.error(error);
      }
    }
    else{
      console.warn("enter username and password");
    }
      */
  }

  return (
    <>
      <div className="courses-view flex flex-col">
        <div className="courses-view-header flex justify-center ">
          <img src="./src/assets/logos/temp_logo.png" />
          <h1>Courses</h1>
          <button>
            <List />
          </button>
        </div>
        <div className="course-view-body flex flex-col">
          <div className="course-view-body-header">
            <div className="search-bar">
              <input type="search" placeholder="Search Courses" />
            </div>
<div className="create-course">
  <Button onClick={() => setCourseCreationForm(true)}>
    Create Section
  </Button>

  <Modal
    isOpen={courseCreationForm}
    onClose={() => setCourseCreationForm(false)}
  >
    {/*
    <PublicationForm onClose={(()=>{setCourseCreationForm(false)})} FormType={"Course"} />
    */}
    <PublicationForm onClose={(()=>{setCourseCreationForm(false)})} FormType={"Section"} course_id={1} />
  </Modal>
</div>

          </div>
          <div className="course-view-body-body grid grid-cols-3 gap-4">
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="Creole | Kouri-Vini Language"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_1.png"
            />
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="Standard Hawaiian Language"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_2.png"
            />
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="Lantern Building"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_3.png"
            />
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="Ancestry Tree Cutout"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_4.png"
            />
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="Lost Icons | Louisiana"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_5.png"
            />
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="History of Recycling"
              progress={0.3}
              imageLink="./src/assets/course_image_placeholder_6.png"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseView;
