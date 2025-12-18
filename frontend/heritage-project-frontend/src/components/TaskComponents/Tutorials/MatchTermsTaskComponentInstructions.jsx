import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import exampleImage from "@/assets/taskComponentInstructions/MatchTermsComponent.png";

const MatchTermsTaskComponentInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Terms Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Enter a term or prompt in the left-hand column.</li>
          <li>
            Enter its corresponding definition or match in the right-hand
            column.
          </li>
          <li>Click "Add Pair" to create more matching sets.</li>
          <li>
            The component will automatically shuffle the options for the
            end-user.
          </li>
        </ul>
        <img
          src={exampleImage}
          alt="Match terms task usage example"
          className="w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default MatchTermsTaskComponentInstructions;
