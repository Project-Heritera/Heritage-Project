import {
  CardContent,
} from "../../ui/card"
import SummaryText from "./SummaryText";
import SummaryIcon from "./SummaryIcon";
function ProfileSummary({Icon, title, value, fill}) {
  return (
    <div className="flex">
        <SummaryIcon Icon={Icon} fill={fill}></SummaryIcon>
        <SummaryText title={title} value={value}></SummaryText>
    </div>
  )
}

export default ProfileSummary;