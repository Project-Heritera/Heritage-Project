import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom"
import { AspectRatio } from "../ui/aspect-ratio";
function getProgressColor(progress) {
  if (progress < 30) return "bg-red-300";
  if (progress < 60) return "bg-yellow-300";
  return "bg-green-300";
}

export default function CourseCard({ title, description, href, progress, imageLink, courseId, navLink }) {
  const color = getProgressColor(progress);
  console.log("Course id is:", courseId)
  return (
    <Link to={navLink || `/c/${courseId || "#"}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {imageLink && (
            <div className="w-full mx-auto  mt-3 overflow-hidden rounded-md bg-gray-100">
              <AspectRatio ratio={16/11}>
              <img
                src={imageLink}
                alt={title}
                className="w-full h-full object-cover"
              />
              </AspectRatio>

            </div>
          )}
          <ScrollArea className="h-18">
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </ScrollArea>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 ">
            <Progress value={progress} indicatorColor={color} />
            <p className="text-sm text-muted-foreground">{Math.ceil(progress)}% complete</p>
          </div>
        </CardContent>
      </Card>
    </Link>


  );
}
