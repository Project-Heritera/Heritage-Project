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
  } catch (e) {
    console.error("Failed to parse jsonData:", e);
    parsedJsonData = jsonData || {};
  }

  const [numberOfAttempts, setNumberOfAttempts] = useState(
    questionProgressData?.attempts ?? 0
  );
  const [metadata, setMetadata] = useState(
    questionProgressData?.metadata ?? {}
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
    <div className="question-wrapper">
      <QuestionTaskComponent
        ref={questionComponentRef}
        jsonData={parsedJsonData}
        isEditing={isEditing}
        serialize={serialize}
      />
      {!isEditing && (
        <div className="question-actions">
          <button
            onClick={handleSubmit}
            className="submit-question-button"
            disabled={taskStatus === statusTypes.COMPLE}
          >
            Submit
          </button>
        </div>
      )}
      {!isCorrect && numberOfAttempts === 0 && hint && (
        <p className="hint">{hint}</p>
      )}
      {showHint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default QuestionTaskComponentWrapper;
