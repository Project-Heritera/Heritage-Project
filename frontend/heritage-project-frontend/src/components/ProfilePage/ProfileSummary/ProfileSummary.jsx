import {
  CardContent,
} from "../../ui/card"
import Summary from "./Summary"
import { Flag, Clock, CheckCircle } from "lucide-react"
function ProfileSummary() {
  return (
    <div className="profileSummaryDiv">
        <Summary Icon={Flag} title={"Courses Completed"} value={"27"} fill={true} ></Summary>
        <Summary Icon={Clock} title={"Week Activity"} value={"27min"}></Summary>
        <Summary Icon={CheckCircle} title={"Connections"} value={"200"}></Summary>
    </div>
  )
}

export default ProfileSummary;