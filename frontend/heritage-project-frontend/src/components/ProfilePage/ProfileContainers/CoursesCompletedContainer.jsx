import ProfileContainer from "./ProfileContainer";
import CourseCard from "@/components/CourseViewer/CourseCard";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function CoursesCompletedContainer({ username }) {
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCompletedCourses = async () => {
            try {
                const response = await api.get(`/accounts/courses_completed/${username}`);
                console.log("API compelted coruses response:", response.data)
                setCompletedCourses(response.data);
            } catch (error) {
                console.error("Error geting CompletedCourses:", error)
            }
        };

        fetchCompletedCourses();
    }, []);

    if (!completedCourses) {
        return (
            <ProfileContainer title={"Completed Courses"} itemsPerRow={3}>
            </ProfileContainer>
        )
    }

    return (
        <ProfileContainer title={"Completed Courses"} itemsPerRow={3}>
            {!loading &&
                completedCourses.map((course) => (
                    <CourseCard
                        key={course.title}
                        link={`/c/${course_id}`}
                        title={course.title}
                        description={course.description}
                        imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${course.image}`}
                        courseId={course.course_id}
                        progress={course.progress_percent}
                    />
                ))
            }
        </ProfileContainer>
    )
}

export default CoursesCompletedContainer;