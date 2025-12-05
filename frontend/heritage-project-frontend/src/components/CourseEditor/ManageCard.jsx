import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom"
import { Button } from "../ui/button";
import PublishCourse from "./PublishCourse";
import { useState } from "react";

export default function ManageCard({ courseId, isPublished }) {
    const [published, setPublished] = useState(isPublished)
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Manage your course</CardTitle>
                <Link to={`/s/${courseId || "#"}`}>
                    <Button className="hover:shadow-lg transition-shadow cursor-pointer">
                        Course Settings
                    </Button>
                </Link>
                <CardTitle className="text-lg font-semibold">Manage access: </CardTitle>
                <PublishCourse isPublished={isPublished} courseId={courseId}/>
            </CardHeader>
        </Card>


    );
}
