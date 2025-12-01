import SectionDropdown from "@/components/RoomsPage/SectionDropdown";
import { useParams } from "react-router-dom";
import CourseCard from "@/components/CourseViewer/CourseCard";
import { progress } from "framer-motion";
import SectionsHolder from "@/components/RoomsPage/SectionsHolder";
//Displays a list of cours given a room
function CourseDashboard() {
  const { courseName } = useParams();

  const rooms = [
    { title: "Room 1", link: "/" },
    { title: "Room 2", link: "/" }
  ]

  //Get the sections of the course

  return (
    <div className="flex justify-center w-full min-h-screen p-6 bg-gray-50">
      <div className="flex w-full max-w-[95%] gap-6 items-start">
        {/* Main div*/}
        <div className="w-3/4">
          <SectionsHolder>
            <SectionDropdown title={"Section 1"} description={"This is random description about the section 1 of this course"} rooms={rooms} />
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