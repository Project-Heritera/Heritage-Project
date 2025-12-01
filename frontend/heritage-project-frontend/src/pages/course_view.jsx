import { useState, useEffect } from "react";
import { List } from "lucide-react";
import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SearchBar from "@/components/Common/Search/SearchBar";
import api from "../services/api"

// Helper to generate a random progress value (0–1)
const rand = () => Math.random().toFixed(2);

const CourseView = () => {
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    setLoading(true)
    console.log("Retrieving coruses")
    const getCourses = async () => {
      try {
        const response = await api.get(`/website/courses/`)
        const courseList = response.data;

        console.log("Loaded course list is:", courseList)
        setCourses(courseList || [])
      } catch (error) {
        console.error("Error retrieving courses:", error)
      } finally {
        setLoading(false)
      }
    }

    getCourses()
  }, [])

  return (
    <>
      <div className="courses-view flex flex-col">
        <div className="courses-view-header flex  ">
          <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight m-4">
            Course List
          </h2>
        </div>
        <SearchBar includeCourses={true} courseAction={() => {
          console.log("Navigating to course")
        }}
          searchFiller={"Search courses"} />

        <Card className="course-view-body flex flex-col p-4 m-4">
          <div className="course-view-body-body grid grid-cols-3 gap-4">

            {!loading && (
              courses.map((course) => (
                <CourseCard key={course.title} link="" title={course.title} description={course.description} imageLink={course.image} courseId={course.course_id}/>
              ))
            )}

            
          </div>
        </Card>
      </div>
    </>
  );
};

export default CourseView;
