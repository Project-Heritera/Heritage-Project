import {Card, CardContent} from "../../ui/card"
import BadgeImage from "./BadgeImage";

function Badge({image, title}) {
  return (
    <Card>
        <CardContent>
            {/* Display the Image */}
            <BadgeImage badgeImage={image}></BadgeImage>
        </CardContent>
    </Card>
  )
}

export default Badge;