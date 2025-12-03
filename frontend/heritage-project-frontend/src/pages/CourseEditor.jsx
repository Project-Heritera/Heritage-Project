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
//Displays a list of cours given a room
function CreationDashboard() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true)

  const [sections, setSections] = useState([])
  const [courseInfo, setCourseInfo] = useState(null)
  useEffect(() => {
    setLoading(true)

    const getData = async () => {
      try {
        //Get course data
        const courseResponse = await api.get(`/website/course/${courseId}/`)
        const courseData = courseResponse.data
        console.log("Retrieved course data:", courseData)
        setCourseInfo(courseData)
        //Get sections
        const sectionsResponse = await api.get(`/website/courses/${courseId}/sections/`)
        const sectionsData = sectionsResponse.data
        console.log("Retrieved course sections:", sectionsData)
        setSections(sectionsData)
      } catch (error) {
        console.error("Error retrieving course sections: ", error)
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
          View and add to your course
        </h2>

        <div className="flex gap-6 items-start">
          {/* Main div*/}
          <div className="w-3/4">
            <div>
              <SectionsHolder>
                {sections && sections.map((section) => (
                  <EditorSectionDropdown key={section.title} title={section.title} description={section.description} sectionId={section.section_id} courseId={courseId} />
                ))}
              </SectionsHolder>
            </div>
            <div className="mt-6">
              <CreationForm FormType={"Section"} course_id={courseId}/>
            </div>
          </div>
          {/* Side div*/}
          <div className="flex-1 flex flex-col gap-6">
            <CourseCard title={courseInfo.title} description={courseInfo.description} progress={courseInfo.progress_percent} imageLink={`${courseInfo.image}`} />
            <ManageCard courseId={courseId}/>
          </div>
        </div>
      </div>


    </div>
  )
}

export default CreationDashboard;