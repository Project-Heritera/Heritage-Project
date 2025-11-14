import {
  CardContent,
} from "../../ui/card"
import Summary from "./Summary"
import { Flag, Clock, CheckCircle } from "lucide-react"
function ProfileSummary() {
  return (
    <div className="flex">
        <Summary Icon={Flag} title={"Courses Completed"} value={"27"} fill={true} ></Summary>
        <Summary Icon={Clock} title={"Courses Completed"} value={"27"}></Summary>
        <Summary Icon={CheckCircle} title={"Courses Completed"} value={"27"}></Summary>
    </div>
  )
}

export default ProfileSummary;