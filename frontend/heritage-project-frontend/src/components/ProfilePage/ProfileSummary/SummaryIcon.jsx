import {
    Card,
    CardContent,
} from "../../ui/card"
function SummaryIcon({Icon, fill}) {
  return (
    <Card className="summaryIconCard">
            <Icon className="summaryIcon"  fill={fill ? "currentColor" : "none"}/>
    </Card>
  )
}

export default SummaryIcon;