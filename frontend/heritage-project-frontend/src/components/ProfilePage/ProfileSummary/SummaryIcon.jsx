import {
    Card,
    CardContent,
} from "../../ui/card"
function SummaryIcon({Icon, fill}) {
  return (
    <Card className="w-1/8 aspect-square flex h-full items-center justify-center">
            <Icon className="h-4/4 w-4/4"  fill={fill ? "currentColor" : "none"}/>
    </Card>
  )
}

export default SummaryIcon;