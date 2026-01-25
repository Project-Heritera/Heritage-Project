import ProfileContainer from "./ProfileContainer";
import CourseCard from "@/components/CourseViewer/CourseCard";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function CoursesCompletedContainer({ username }) {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      try {
        const response = await api.get(
          `/accounts/courses_completed/${username}`,
        );
        setCompletedCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error geting CompletedCourses:", error);
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [username]);

  if (!completedCourses) {
    return (
      <ProfileContainer
        title={"Completed Courses"}
        itemsPerRow={3}
      ></ProfileContainer>
    );
  }

  return (
    <ProfileContainer title={"Completed Courses"} itemsPerRow={3}>
      {!loading &&
        completedCourses.map((course) => (
          <CourseCard
            key={course.title}
            link={`/c/${course.course_id}`}
            title={course.title}
            description={course.description}
            imageLink={course.image}
            courseId={course.course_id}
            progress={course.progress_percent}
          />
        ))}
    </ProfileContainer>
  );
}

export default CoursesCompletedContainer;
