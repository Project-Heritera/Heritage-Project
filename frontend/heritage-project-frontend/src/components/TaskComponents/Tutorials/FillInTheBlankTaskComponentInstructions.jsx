import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/FillInTheBlankComponent.png";

const FillInTheBlankTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fill in the Blank Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Write your sentence or paragraph in the main text area.</li>
          <li>To create a blank, wrap the answer word(s) in double curly braces, like {this}.</li>
          <li>You can create multiple blanks in a single component.</li>
          <li>The component will automatically generate input fields for the user.</li>
        </ul>
        <img
          src={exampleImage}
          alt="Fill in the blank task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default FillInTheBlankTaskComponentInstructions;