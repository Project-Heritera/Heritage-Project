import { useState, useEffect } from "react";
import { Debug } from "@/utils/debugLog";
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
import LocalSearchBar from "@/components/CourseEditDashboard/ContributorSearchBar";
// Helper to generate a random progress value (0–1)
const rand = () => Math.random().toFixed(2);

const CourseView = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const getCourses = async () => {
      try {
        const response = await api.get(`/website/courses/`);
        const courseList = response.data;

        Debug.log("Loaded course list is:", courseList);
        setCourses(courseList || []);
      } catch (error) {
        console.error("Error retrieving courses:", error);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    // safely get the string, checking both possible keys
    const courseString = course.title || "";

    return courseString.toLowerCase().includes(filterQuery.toLowerCase());
  });
  return (
    <div className="courses-view flex flex-col p-8 gap-4 min-h-screen">
      <div className="courses-view-header flex-col">
        <div
          className="flex items-center justify-between m-4"
          style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
        >
          <h1 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
            Course List
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 m-4">
          <div>
            <LocalSearchBar onSearchChange={setFilterQuery} />
          </div>
          <div className="create-course">
            <CreationForm FormType={"Course"} />
          </div>
        </div>
      </div>

      <div className="course-view-body-body grid grid-cols-3 gap-4">
        {!loading &&
          filteredCourses.map((course) => (
            <CourseCard
              key={course.title}
              link=""
              title={course.title}
              description={course.description}
              imageLink={`${import.meta.env.VITE_API_URL}${course.image}`}
              courseId={course.course_id}
              progress={course.progress_percent}
            />
          ))}
      </div>
    </div>
  );
};
export default CourseView;
