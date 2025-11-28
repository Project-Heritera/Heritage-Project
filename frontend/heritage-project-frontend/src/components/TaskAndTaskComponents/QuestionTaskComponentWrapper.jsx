import { useState, useContext, useRef, useEffect } from "react";
import { statusTypes, statusDisplayToKey } from "../../utils/statusTypes";
import { TaskGlobalContext } from "./TaskBase";
import { update_task_progress } from "../../services/room";

function QuestionTaskComponentWrapper({
  jsonData,
  QuestionTaskComponent,
  isEditing,
  serialize,
  taskID,
  questionProgressData,
}) {
  // Parse jsonData if it's a string, otherwise use as-is
  let parsedJsonData;
  try {
    parsedJsonData =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
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
  const [showHint, setShowHint] = useState(false);
  const questionComponentRef = useRef(null);

  const { taskStatus, setTaskStatus } = useContext(TaskGlobalContext) || {}; // states from task
  const [isCorrect, setIsCorrect] = useState(taskStatus === "COMPLE");

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

    //update task progress in serveer
    const updated_task_progress_data = {
      attempts: numberOfAttempts,
      status: statusDisplayToKey[result],
      metadata: metadata,
    };
    try {
      update_task_progress(taskID, updated_task_progress_data);
    } catch (error) {
      console.log("Error", error);
    }

    //set states that effect question component rendering
    if (result === statusTypes.COMPLE) {
      setIsCorrect(true);
    } else if (result === statusTypes.INCOMP) {
      setIsCorrect(false);
      if (numberOfAttempts > 0) {
        setNumberOfAttempts((prev) => prev - 1);
      }
    }
  };

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
          serialize={serialize}
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
