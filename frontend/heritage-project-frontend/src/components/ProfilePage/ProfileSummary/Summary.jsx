import {
  CardContent,
} from "../../ui/card"
import SummaryText from "./SummaryText";
import SummaryIcon from "./SummaryIcon";
function Summary({Icon, title, value, fill}) {
  return (
    <div className="flex items-center">
        <SummaryIcon Icon={Icon} fill={fill}></SummaryIcon>
        <SummaryText title={title} value={value}></SummaryText>
    </div>
  )
}

export default Summary;