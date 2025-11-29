import { useState, useContext, useRef } from "react";
import statusTypes from "../../utils/statusTypes";
import { TaskGlobalContext } from "./TaskBase";
import { Button } from "@/components/ui/button";

function QuestionTaskComponentWrapper({
  jsonData,
  QuestionTaskComponent,
  isEditing,
  serialize,
  initialAttemptsLeft,
  initialIsCorrect,
}) {
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
      console.error("Question component does not expose checkIfCorrect method");
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
const handleSerialize = (componentTypeToSerialize, jsonToSerialize) => {
      jsonToSerialize["number_of_chances"] = numberOfAttempts
      jsonToSerialize["hints"] = hint
      console.log("in middlewear", jsonToSerialize)
      serialize(taskComponentTypes.OPTION, jsonToSerialize);
    }
  return (
    <>
      {isEditing ? (
        <div className="question-meta-editor flex gap-2 items-center">
          <label className="meta-field">
            <span>Number of attempts:</span>
            <input
              type="number"
              min={1}
              value={numberOfAttempts}
              onChange={(e) => setNumberOfAttempts(Number(e.target.value) || 1)}
              className="meta-input number-of-attempts"
            />
          </label>
          <label className="meta-field">
            <span>Hint:</span>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Enter hint"
              className="meta-input hint-input"
            />
          </label>
        </div>
      ) : (
        <div className="question-meta-display">
          <div>Number of attempts: {numberOfAttempts}</div>
        </div>
      )}
      <div className="question-wrapper">
        <QuestionTaskComponent
          ref={questionComponentRef}
          jsonData={parsedJsonData}
          isEditing={isEditing}
          serialize={handleSerialize}
        />
        {!isEditing && (
          <div className="question-actions">
            <Button
                          onClick={handleSubmit}
              className="submit-question-button bg-blue-500"
              disabled={taskStatus === statusTypes.COMPLE}
            > 
Submit

            </Button>
         </div>
        )}
        {!isCorrect && attemptsLeft === 0 && parsedJsonData.hint && (
          <p className="hint">{parsedJsonData.hint}</p>
        )}
        {showHint && <p className="hint">{parsedJsonData.hint}</p>}
      </div>
    </>
  );
}

export default QuestionTaskComponentWrapper;