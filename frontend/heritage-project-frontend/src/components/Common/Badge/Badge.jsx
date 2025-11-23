import {Card, CardContent, CardTitle, CardDescription} from "../../ui/card"
import BadgeImage from "./BadgeImage";

function Badge({image, title}) {
  console.log("Image is:", image)
  return (
    <Card>
        <CardContent className="badgeContent">
            {/* Display the Image */}
            <BadgeImage badgeImage={image}></BadgeImage>
            <CardTitle>{title}</CardTitle>
            <CardDescription>This badge is awared for the completion of the Creole Course</CardDescription>
        </CardContent>
    </Card>
  )
}

export default Badge;