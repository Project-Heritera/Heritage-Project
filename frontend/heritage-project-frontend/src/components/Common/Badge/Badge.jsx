import {Card, CardContent, CardTitle, CardDescription} from "../../ui/card"
import BadgeImage from "./BadgeImage";

function Badge({image, title, description}) {
  const badgePicLink = `${import.meta.env.VITE_API_URL_FOR_TEST}${image}`
  return (
    <Card>
        <CardContent className="badgeContent">
            {/* Display the Image */}
            <BadgeImage badgeImage={badgePicLink}></BadgeImage>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardContent>
    </Card>
  )
}

export default Badge;