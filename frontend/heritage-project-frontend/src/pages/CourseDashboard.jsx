import SectionDropdown from "@/components/RoomsPage/SectionDropdown";
import { useParams } from "react-router-dom";
import CourseCard from "@/components/CourseViewer/CourseCard";
import { progress } from "framer-motion";
import SectionsHolder from "@/components/RoomsPage/SectionsHolder";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { tr } from "date-fns/locale";
//Displays a list of cours given a room
function CourseDashboard() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true)
  

  const rooms = [
    { title: "Room 1", link: "/" },
    { title: "Room 2", link: "/" }
  ]

  //Get the sections of the course
  const [sections, setSections] = useState([])
  useEffect(() => {
    setLoading(true)
    const getSections = async () => {
      try {
        const response = await api.get(`/website/courses/${courseId}/sections/`)
        const sectionsData = response.data
        console.log("Retrieved course sections:", sectionsData)
        setSections(sectionsData)
      } catch (error) {
        console.error("Error retrieving course sections: ", error)
      } finally {
        setLoading(false)
      }
    }
    getSections();
  }, [])

  if (loading) {
    return (<div>Loading...</div>)
  }

  return (
    
    <div className="flex justify-center w-full min-h-screen p-6 bg-gray-50">
      <div className="flex w-full max-w-[95%] gap-6 items-start">
        {/* Main div*/}
        <div className="w-3/4">
          <SectionsHolder>
            {sections && sections.map((section) => (
              <SectionDropdown key={section.title} title={section.title} description={section.description} sectionId={section.section_id}/>
            ))}
          </SectionsHolder>
        </div>
        {/* Side div*/}
        <div className="flex-1">
          <CourseCard title={"Data Structures"} description={"This is the description of the data structures. it all starts with random data structures. it also talks alot abotu randoming networking stuff."} progress={50} />
        </div>
      </div>
    </div>
  )
}

export default CourseDashboard;