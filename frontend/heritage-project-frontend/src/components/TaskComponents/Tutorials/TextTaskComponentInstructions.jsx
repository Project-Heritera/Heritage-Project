import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/TextComponent.png";

const TextTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Click inside the editor to begin typing.</li>
          <li>Use the toolbar to insert special characters.</li>
          <li>Switch to read mode to preview the final result.</li>
        </ul>
        <img
          src={exampleImage}
          alt="Text task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default TextTaskComponentInstructions;
