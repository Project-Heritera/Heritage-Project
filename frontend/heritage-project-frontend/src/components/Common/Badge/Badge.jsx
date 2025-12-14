import { Card, CardContent, CardTitle, CardDescription } from "../../ui/card";
import BadgeImage from "./BadgeImage";

const sizeClasses = {
  sm: "w-20 p-2 text-xs",
  md: "w-32 p-4 text-sm",
  lg: "w-48 p-6 text-base",
};

function Badge({ image, title, description, size = "md" }) {
  const badgePicLink = `${import.meta.env.VITE_API_URL_FOR_TEST}${image}`;
  return (
    <Card className={sizeClasses[size]}>
      <CardContent className="flex flex-col items-center gap-2 p-0">
        <BadgeImage badgeImage={badgePicLink} />
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default Badge;
