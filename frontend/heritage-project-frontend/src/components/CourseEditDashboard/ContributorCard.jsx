//Handle what the cards look like fro individual rooms in the drop down.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Assuming you use lucide-react (standard in shadcn)
const RoomCard = ({ username, description, imageLink, navigateLink, onTrash }) => {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            {/* Left Side: Avatar + Text */}
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={imageLink} />
                    <AvatarFallback>{username && username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">
                        {username}
                    </h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Side: Actions (Delete Button) */}
            {onTrash && (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={onTrash}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RoomCard;