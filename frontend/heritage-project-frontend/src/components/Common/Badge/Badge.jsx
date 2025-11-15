import {Card, CardContent, CardTitle, CardDescription} from "../../ui/card"
import BadgeImage from "./BadgeImage";

function Badge({image, title}) {
  return (
    <Card className="h-90 w-80">
        <CardContent className="flex-col">
            {/* Display the Image */}
            <BadgeImage badgeImage={image}></BadgeImage>
            <CardTitle>Creole Completed</CardTitle>
            <CardDescription>This badge is awared fr0o the completion of the Creole Course</CardDescription>
        </CardContent>
    </Card>
  )
}

export default Badge;