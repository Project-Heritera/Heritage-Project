import { Progress } from "@/components/ui/progress"

function getProgressColor(progress) {
    if (progress < 30) return "bg-red-300";
    if (progress < 60) return "bg-yellow-300";
    return "bg-green-300";
}

const RoomProgress = ({ progress }) => {
    const color = getProgressColor(progress);
    return (
        <div className="space-y-2 ">
            <Progress value={progress} indicatorColor={color} />
            <p className="text-sm text-muted-foreground">{Math.ceil(progress)}% complete</p>
        </div>
    );
};

export default RoomProgress;