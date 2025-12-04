import {
  CardContent,
} from "../../ui/card"
import Summary from "./Summary"
import { Flag, NotebookPen, Handshake } from "lucide-react"
import { useState, useEffect } from "react";
import api from "@/services/api";

function ProfileSummary({username}) {

  const [contributedCourses, setContributedCourses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
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

    const fetchConnections = async () => {
      try {
        const response = await api.get(`/accounts/friends/${username}/`);
        console.log("API connections response:", response.data.friends)
        setConnections(response.data.friends);
      } catch (error) {
        console.error("Error geting badges:", error)
      }
    };

    const fetchCompletedCourses = async () => {
      try {
        const response = await api.get(`/accounts/courses_completed/${username}`);
        console.log("API compelted coruses response:", response.data)
        setCompletedCourses(response.data);
      } catch (error) {
        console.error("Error geting CompletedCourses:", error)
      }
    };

    fetchCompletedCourses();

    fetchConnections();

    fetchContributedCourses();
    setLoading(false)
  }, []);

  return (
    <div className="profileSummaryDiv">
      <Summary Icon={Flag} title={"Courses Completed"} value={ completedCourses && completedCourses.length || 0 } ></Summary>
      <Summary Icon={NotebookPen} title={"Courses Created"} value={contributedCourses && contributedCourses.length || 0}></Summary>
      <Summary Icon={Handshake} title={"Connections"} value={connections && connections.length || 0}></Summary>
    </div>
  )
}

export default ProfileSummary;