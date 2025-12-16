import { Badge } from "@/components/ui/badge";

const TextTaskComponentInstructions = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm space-y-2">
        <p>• Click inside the editor to begin typing.</p>
        <p>• Use the toolbar to insert special characters.</p>
        <p>• Switch to read mode to preview the final result.</p>
      </div>
      <img
        src="/images/text-task-example.png"
        alt="Text task usage example"
        className="w-full rounded-md border"
      />
    </div>
  );
};

export default TextTaskComponentInstructions;
