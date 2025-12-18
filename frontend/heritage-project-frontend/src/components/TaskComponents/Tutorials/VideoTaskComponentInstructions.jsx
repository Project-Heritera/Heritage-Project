import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/VideoComponent.png";

const VideoTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            Click the upload button to select a video file from your device.
          </li>
          <li>
            Alternatively, paste a video link from a supported platform (e.g.,
            YouTube, Vimeo).
          </li>
          <li>Add an optional description for the video.</li>
        </ul>
        <img
          src={exampleImage}
          alt="Video task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default VideoTaskComponentInstructions;
