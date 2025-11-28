import ProfileContainer from "./ProfileContainer";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function CompletedCoursesContainer({username}) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get(`/website/another_badges/${username}`);
        console.log("API badges response:", response.data)
        setBadges(response.data);
      } catch (error) {
        console.error("Error geting badges:", error)
      }
    };

    fetchBadges();
  }, []);

  if (!badges) {
      return <div>Loading...</div>;
  }

  return (
    <ProfileContainer title={"Courses Completed"} itemsPerRow={3}>
        {courses && courses.map((course) => (
          
        ))}
    </ProfileContainer>
  )
}

export default CompletedCoursesContainer;