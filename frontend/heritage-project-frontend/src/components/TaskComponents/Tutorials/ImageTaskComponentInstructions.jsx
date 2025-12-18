import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/ImageComponent.png";

const ImageTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Click the upload button to select an image from your device.</li>
          <li>
            You can also drag and drop an image file into the upload area.
          </li>
          <li>Add an optional caption to provide context for your image.</li>
        </ul>
        <img
          src={exampleImage}
          alt="Image task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default ImageTaskComponentInstructions;
