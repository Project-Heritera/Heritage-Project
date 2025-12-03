import EditorSectionDropdown from "@/components/CourseEditor/EditorSectionDropdown";
import { useParams } from "react-router-dom";
import CourseCard from "@/components/CourseViewer/CourseCard";
import { progress } from "framer-motion";
import SectionsHolder from "@/components/RoomsPage/SectionsHolder";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import CreationForm from "@/components/CourseView/CreationForm";
import ManageCard from "@/components/CourseEditor/ManageCard";
import LocalSearchBar from "@/components/CourseEditDashboard/ContributorSearchBar";
import CreatePageCard from "@/components/CreatePage/CreatePageCard";
//Displays a list of cours given a room
function CreatePage() {
  const [loading, setLoading] = useState(true)

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    setLoading(true)

    const getData = async () => {
      try {
        const response = await api.get(`/website/courses_contributed/`);
        const courseList = response.data;

        console.log("Loaded course list is:", courseList);
        setCourses(courseList || []);
      } catch (error) {
        console.log("Error retrieving editable courses: ", error)
      } finally {
        setLoading(false)
      }
    }
    getData();
  }, [])

  if (loading) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-6 ">
      <div className="w-full max-w-[95%]">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Navigate editable courses
        </h2>

        <div className="flex gap-6 items-start">
          {/* Main div*/}
          <div className="w-3/4">

            {/* --- HEADER ROW (Search + Create Button) --- */}
            <div className="flex flex-row justify-between items-center w-full mb-6">
              <div className="w-[20%] min-w-[300px]">
                <LocalSearchBar />
              </div>
              <div className="create-course">
                <CreationForm FormType={"Course"} />
              </div>
            </div>
            {/* --- END HEADER ROW --- */}

            {/* --- GRID ROW (Moved OUTSIDE the header flex row) --- */}
            <div className="course-view-body-body grid grid-cols-3 gap-4">
              {!loading &&
                courses.map((course) => (
                  <CourseCard
                    key={course.title}
                    link=""
                    title={course.title}
                    description={course.description}
                    imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${course.image}`}
                    courseId={course.course_id}
                    progress={course.progress_percent}
                    navLink={`/ce/${course.course_id}`}
                  />
                ))}
            </div>

          </div>

          {/* Side div*/}
          <div className="flex-1 flex flex-col gap-6">
            <CreatePageCard/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage;