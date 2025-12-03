//Handle what the cards look like fro individual rooms in the drop down.
import RoomProgress from "./RoomProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom"
const RoomCard = ({ title, description, imageLink, navigateLink, progress }) => {
    console.log("Image is:", imageLink)
    return (
        <Link to={navigateLink || "#"} className="block group">
            <div className="
                flex items-start gap-4  rounded-lg
                border border-transparent
             
                transition-all duration-200 
                cursor-pointer 
                active:scale-[0.99]
            ">
                <div>
                    <Avatar className="h-16 w-16 border transition-colors group-hover:border-primary">
                        <AvatarImage src={imageLink} />
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
                        <RoomProgress progress={progress} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;