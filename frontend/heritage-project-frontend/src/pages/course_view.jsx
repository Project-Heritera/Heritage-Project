import { useState } from "react";
import { List } from "lucide-react";
import "../styles/pages/course_view.css";

const CourseView = () => {
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
          </div>
          <div className="course-view-body-body grid grid-cols-3 gap-4">
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_1.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  Creole | Kouri-Vini Language
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_2.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  Standard Hawaiian Language
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_3.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  Lantern Building
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_4.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  Ancestry Tree Cutout
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_5.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  Lost Icons | Louisiana
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
            <div className="course-container">
              <div className="course-image">
                <img src="./src/assets/course_image_placeholder_6.png" />
              </div>
              <div className="course-title">
                <a href="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53">
                  History of Recycling
                </a>
              </div>
              <div className="course-progress-bar flex flex-row">
                <p>30%</p>
                <progress value={0.3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseView;
