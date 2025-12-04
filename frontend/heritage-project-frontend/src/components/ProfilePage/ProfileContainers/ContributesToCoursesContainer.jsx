import ProfileContainer from "./ProfileContainer";
import CourseCard from "@/components/CourseViewer/CourseCard";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function CoursesCompletedContainer({ username }) {
    const [contributedCourses, setContributedCourses] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContributedCourses = async () => {
            try {
                const response = await api.get(`/accounts/courses_created/${username}`);
                console.log("API compelted coruses response:", response.data)
                setContributedCourses(response.data);
            } catch (error) {
                console.error("Error geting ContributedCourses:", error)
            }
        };

        fetchContributedCourses();
    }, []);

    if (!contributedCourses) {
        return (
            <ProfileContainer title={"Contributes to Courses"} itemsPerRow={3}>
            </ProfileContainer>
        )
    }

    return (
        <ProfileContainer title={"Contributes to Courses"} itemsPerRow={3}>
            {!loading &&
                contributedCourses.map((course) => (
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