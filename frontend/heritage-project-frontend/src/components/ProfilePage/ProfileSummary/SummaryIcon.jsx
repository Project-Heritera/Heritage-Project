import {
    Card,
    CardContent,
} from "../../ui/card"
function SummaryIcon({Icon, fill}) {
  return (
    <Card className="h-12 w-12 flex items-center justify-center">
            <Icon className="h-6 w-6 shrink-0"  fill={fill ? "currentColor" : "none"}/>
    </Card>
  )
}

export default SummaryIcon;