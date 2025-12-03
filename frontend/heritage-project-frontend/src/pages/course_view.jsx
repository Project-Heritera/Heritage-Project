import { useState, useEffect } from "react";
import { List } from "lucide-react";
import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SearchBar from "@/components/Common/Search/SearchBar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreationForm from "@/components/CourseView/CreationForm";
import { useParams } from "react-router-dom";
import Modal from "@/components/Modal";
// Helper to generate a random progress value (0–1)
const rand = () => Math.random().toFixed(2);

const CourseView = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    console.log("Retrieving coruses");
    const getCourses = async () => {
      try {
        const response = await api.get(`/website/courses/`);
        const courseList = response.data;

        console.log("Loaded course list is:", courseList);
        setCourses(courseList || []);
      } catch (error) {
        console.error("Error retrieving courses:", error);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  return (
    <>
      <div className="courses-view flex flex-col p-8 gap-4 min-h-screen">
        <div className="courses-view-header flex-col  ">
          <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight m-4">
            Course List
          </h2>
          <div className="flex flex-row justify-between items-center w-full">
            <div className="w-[20%] min-w-[300px]">
              <SearchBar
                includeCourses={true}
                courseAction={(course) => {
                  console.log("Navigating to course");
                  navigate(`/c/${course.course_id || "#"}`);
                }}
                searchFiller={"Search courses"}
              />
            </div>
            <div className="create-course">
              <CreationForm FormType={"Course"} />
            </div>
          </div>
        </div>

        <div className="course-view-body-body grid grid-cols-3 gap-4">
          {!loading &&
            courses.map((course) => (
              <CourseCard
                key={course.title}
                link=""
                title={course.title}
                description={course.description}
                imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${course.image
                  }`}
                courseId={course.course_id}
                progress={course.progress_percent}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default CourseView;
