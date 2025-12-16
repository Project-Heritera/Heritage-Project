import { Card, CardContent, CardTitle, CardDescription } from "../../ui/card";
import BadgeImage from "./BadgeImage";

function Badge({ image, title, description}) {
  const badgePicLink = `${import.meta.env.VITE_API_URL_FOR_TEST}${image}`;
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-0">
        <BadgeImage badgeImage={badgePicLink} />
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default Badge;
