import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom"
import { Button } from "../ui/button";

export default function ManageCard({ courseId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Manage your course</CardTitle>
                <Link to={`/s/${courseId || "#"}`}>
                    <Button className="hover:shadow-lg transition-shadow cursor-pointer">
                        Course Settings
                    </Button>
                </Link>
            </CardHeader>
        </Card>


    );
}
