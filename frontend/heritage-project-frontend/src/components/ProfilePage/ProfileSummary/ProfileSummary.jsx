import {
  CardContent,
} from "../../ui/card"
import Summary from "./Summary"
import { Flag, Clock, CheckCircle } from "lucide-react"
function ProfileSummary() {
  return (
    <CardContent>
        <Summary Icon={Flag} title={"Courses Completed"} value={"27"}></Summary>
    </CardContent>
  )
}

export default ProfileSummary;