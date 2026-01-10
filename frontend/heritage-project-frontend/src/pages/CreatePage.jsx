import { Debug } from "@/utils/debugLog";
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
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    setLoading(true);

    const getData = async () => {
      try {
        const response = await api.get(`/website/courses_contributed/`);
        const courseList = response.data;

        Debug.log("Loaded course list is:", courseList);
        setCourses(courseList || []);
      } catch (error) {
        console.log("Error retrieving editable courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredCourses = courses.filter((course) => {
    // safely get the string, checking both possible keys
    const courseString = course.title || "";

    return courseString.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-8">
      <div className="w-full max-w-[95%]">
        <div
          className="flex items-center justify-between m-4"
          style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
        >
          <h1 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
            Navigate editable courses
          </h1>
        </div>

        {/* Main div */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-4 m-4">
            <div className="flex-1 flex flex-col gap-6">
              <CreatePageCard />
            </div>

            {/* --- HEADER ROW (Search + Create Button) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-6 gap-4">
              <div className="w-full md:w-1/3 min-w-[200px]">
                <LocalSearchBar onSearchChange={setFilterQuery} />
              </div>
              <div className="w-full md:w-auto">
                <CreationForm FormType={"Course"} />
              </div>
            </div>
            {/* --- END HEADER ROW --- */}

            {/* --- GRID ROW --- */}
            <div className="course-view-body-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!loading &&
                filteredCourses.map((course) => (
                  <CourseCard
                    key={course.title}
                    link=""
                    title={course.title}
                    description={course.description}
                    imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${
                      course.image
                    }`}
                    courseId={course.course_id}
                    progress={course.progress_percent}
                    navLink={`/ce/${course.course_id}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
