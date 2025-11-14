import {
  CardContent,
} from "../../ui/card"
import SummaryIcon from "./SummaryIcon";
function ProfileSummary({Icon, title, value}) {
  return (
    <CardContent>
        <SummaryIcon Icon={Icon}></SummaryIcon>
    </CardContent>
  )
}

export default ProfileSummary;