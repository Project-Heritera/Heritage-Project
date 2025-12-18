import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/MultipleChoiceComponent.png";

const MultipleChoiceTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Multiple Choice Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Enter the question you want to ask in the main text field.</li>
          <li>Add at least two options for the user to choose from.</li>
          <li>Mark one or more options as the correct answer(s).</li>
          <li>
            <b>
              This component can be configured for single-choice (select one) or
              multiple-choice (select all that apply) answers.
            </b>
          </li>
        </ul>
        <img
          src={exampleImage}
          alt="Multiple choice task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceTaskComponentInstructions;
