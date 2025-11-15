import {
  CardContent,
} from "../../ui/card"
import Summary from "./Summary"
import { Flag, NotebookPen, Handshake } from "lucide-react"
function ProfileSummary() {
  return (
    <div className="profileSummaryDiv">
        <Summary Icon={Flag} title={"Courses Completed"} value={"27"} fill={true} ></Summary>
        <Summary Icon={NotebookPen} title={"Courses Created"} value={"2"}></Summary>
        <Summary Icon={Handshake} title={"Connections"} value={"200"}></Summary>
    </div>
  )
}

export default ProfileSummary;