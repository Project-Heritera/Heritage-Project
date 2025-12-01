//Handle what the cards look like fro individual rooms in the drop down.
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import RoomProgress from "./RoomProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom"
const RoomCard = ({ title, description, imageLink, navigateLink }) => {
    return (
        <Link to={navigateLink || "#"} className="block group">
            <Card className="
                transition-all duration-200 
                hover:shadow-lg hover:border-primary/50 
                cursor-pointer 
                active:scale-[0.99]
            ">
                {/* Show title of room and current progress of it*/}
                <CardContent className="p-4">
                    <div className="flex items-start gap-5">
                        <div>
                            <Avatar className="h-16 w-16 border transition-colors group-hover:border-primary">
                                <AvatarImage src={imageLink}/>
                                <AvatarFallback>{title && title.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div>
                                <h3 className="font-semibold text-lg leading-none tracking-tight">
                                    {title}
                                </h3>
                            </div>
                            <div>
                                {description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <div className="pt-2">
                                <RoomProgress progress={54} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default RoomCard;