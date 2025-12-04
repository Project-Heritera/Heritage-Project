import {
  useState,
  useContext,
  ref,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import statusTypes from "../../utils/statusTypes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Input } from "@/components/ui/input";
import { TaskGlobalContext } from "./TaskBase";
import { Button } from "@/components/ui/button";

const QuestionTaskComponentWrapper = forwardRef(
  (
    {
      jsonData,
      QuestionTaskComponent,
      isEditing,
      initialAttemptsLeft,
      initialIsCorrect,
    },
    ref
  ) => {
    // Parse jsonData if it's a string, otherwise use as-is
    let parsedJsonData;
    try {
      parsedJsonData =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    } catch (e) {
      console.error("Failed to parse jsonData:", e);
      parsedJsonData = jsonData || {};
    }

    const [attemptsLeft, setAttemptsLeft] = useState(
      initialAttemptsLeft ?? parsedJsonData.number_of_chances ?? 1
    );
    const [numberOfAttempts, setNumberOfAttempts] = useState(
      parsedJsonData.number_of_chances ?? 1
    );
    const [hint, setHint] = useState(parsedJsonData.hint ?? "");
    const [isCorrect, setIsCorrect] = useState(initialIsCorrect ?? false);
    const [showHint, setShowHint] = useState(false);
    const questionComponentRef = useRef(null);

    const { taskStatus, setTaskStatus } = useContext(TaskGlobalContext); // states from task

    const handleSubmit = () => {
      if (
        !questionComponentRef.current ||
        !questionComponentRef.current.checkIfCorrect
      ) {
        console.error(
          "Question component does not expose checkIfCorrect method"
        );
        return;
      }
      const result = questionComponentRef.current.checkIfCorrect();
      setTaskStatus(result);

      if (result === statusTypes.COMPLE) {
        setIsCorrect(true);
      } else if (result === statusTypes.INCOMP) {
        setIsCorrect(false);
        if (attemptsLeft > 0) {
          setAttemptsLeft((prev) => prev - 1);
        }
      }
    };
    const handleSerialize = () => {
      if (!questionComponentRef.current?.serialize) {
        console.warn("Child component has no serialize method");
        return null;
      }
      const childData = questionComponentRef.current.serialize();
      // Merge hint and number_of_chances into child's content
      const finalJson = {
        ...childData,
        content: {
          ...childData.content, // keep existing child content (e.g., choiceArray)
          hint,
          number_of_chances: numberOfAttempts,
        },
      };
      return finalJson;
    };

    useImperativeHandle(ref, () => ({
      serialize: handleSerialize,
    }));

    return (
      <Card className="w-full shadow-none border-none">
        {/* Card Header: Meta Editor or Display */}
        <CardHeader className="space-y-2">
          {isEditing ? (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col w-full md:w-1/2">
                <label className="text-sm font-medium mb-1">
                  Number of attempts
                </label>
                <Input
                  type="number"
                  min={1}
                  value={numberOfAttempts}
                  onChange={(e) => setNumberOfAttempts(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col w-full md:w-1/2">
                <label className="text-sm font-medium mb-1">Hint</label>
                <Input
                  type="text"
                  value={hint}
                  placeholder="Enter hint"
                  onChange={(e) => setHint(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Number of attempts: {numberOfAttempts}
            </div>
          )}
        </CardHeader>

        {/* Card Content: Question Component */}
        <CardContent>
          <QuestionTaskComponent
            jsonData={parsedJsonData}
            isEditing={isEditing}
            ref={questionComponentRef}
          />
        </CardContent>

        {/* Card Footer: Actions and Hints */}
        {!isEditing && (
          <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-2">
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={taskStatus === statusTypes.COMPLE}
            >
              Submit
            </Button>

            {!isCorrect && attemptsLeft === 0 && parsedJsonData.hint && (
              <p className="text-sm text-muted-foreground mt-2 md:mt-0">
                {parsedJsonData.hint}
              </p>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }
);

export default QuestionTaskComponentWrapper;
