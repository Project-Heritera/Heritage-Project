import {
  useState,
  useContext,
  ref,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import statusTypes from "../../utils/statusTypes";
import { Checkbox } from "@radix-ui/react-checkbox";
import BadgeAward from "../RoomsPage/BadgeAward";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
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
import { update_task_progress } from "@/services/room";

const QuestionTaskComponentWrapper = forwardRef(
  (
    {
      jsonData,
      QuestionTaskComponent,
      isEditing,
      initialAttemptsLeft,
      initialIsCorrect,
      taskID,
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

    const {
      taskStatus,
      setTaskStatus,
      badge_id,
      badge_title,
      badge_image_url,
    } = useContext(TaskGlobalContext); // states from task

    //for badge award
    const [badgeAwardOpen, setBadgeAwardOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
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
      try {
        const payload = { status: statusTypes.COMPLE };
        const room_complete = await update_task_progress(taskID, payload);
        setTaskStatus(statusTypes.COMPLE);
        if (room_complete) {
          setBadgeAwardOpen(true);
        }
      } catch {
        console.log("Failed to update task progress");
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
                <label className="text-sm font-medium mb-1">Hints</label>
                <Input
                  type="text"
                  value={hint}
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
        <CardContent>
          <QuestionTaskComponent
            jsonData={parsedJsonData}
            isEditing={isEditing}
            ref={questionComponentRef}
          />
        </CardContent>
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
        <Dialog open={badgeAwardOpen} onOpenChange={setBadgeAwardOpen}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-[1000]" />
            <DialogContent className="fixed top-1/2 left-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800">
              <BadgeAward
                badge_id={badge_id}
                badge_title={badge_title}
                badge_image_url={badge_image_url}
                onClose={() => {
                  setBadgeAwardOpen(false);
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/courses");
                  }
                }}
              />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </Card>
    );
  }
);

export default QuestionTaskComponentWrapper;
