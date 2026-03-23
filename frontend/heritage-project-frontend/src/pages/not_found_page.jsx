import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
      <h1 className="text-6xl md:text-8xl font-bold text-gray-500 text-center">
        404 Not Found
      </h1>
      <div className="w-full max-w-lg border-t-2 border-gray-200 dark:border-gray-800"></div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate("/home")}>Go Home</Button>
      </div>
    </div>
  );
}
