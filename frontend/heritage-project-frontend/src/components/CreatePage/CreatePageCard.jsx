import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreatePageCard({ courseId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Creation Dashboard</CardTitle>
                <ScrollArea className="h-18">
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome to your creation dashboard. Navigate the courses you have been invited to or create a new course to start proserving a culture or heritage.
                    </p>
                </ScrollArea>
            </CardHeader>
        </Card>


    );
}
