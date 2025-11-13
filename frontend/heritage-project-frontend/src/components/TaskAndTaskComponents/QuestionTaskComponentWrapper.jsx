import { useState, useContext, useRef } from "react";
import statusTypes from "../../utils/statusTypes";
import { TaskGlobalContext } from "./TaskBase";

function QuestionTaskComponentWrapper({ jsonData, QuestionTaskComponent, isEditing, serialize, initialAttemptsLeft, initialIsCorrect }) {
  // Parse jsonData if it's a string, otherwise use as-is
  let parsedJsonData;
  try {
    parsedJsonData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
  } catch (e) {
    console.error("Failed to parse jsonData:", e);
    parsedJsonData = jsonData || {};
  }
  
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttemptsLeft ?? (parsedJsonData.numOfChances ?? 1));
  const [numberOfAttempts, setNumberOfAttempts] = useState(parsedJsonData.numOfChances ?? 1);
  const [hint, setHint] = useState(parsedJsonData.hint ?? "");
  const [isCorrect, setIsCorrect] = useState(initialIsCorrect ?? false);
  const [showHint, setShowHint] = useState(false);
  const questionComponentRef = useRef(null);

  const { taskStatus, setTaskStatus } = useContext(TaskGlobalContext); // states from task

  const handleSubmit = () => {
    if (!questionComponentRef.current || !questionComponentRef.current.checkIfCorrect) {
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
        setAttemptsLeft(prev => prev - 1);
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
      {!isCorrect && attemptsLeft === 0 && parsedJsonData.hint && (
        <p className="hint">{parsedJsonData.hint}</p>
      )}
      {showHint && <p className="hint">{parsedJsonData.hint}</p>}
    </div>
  );
}

export default QuestionTaskComponentWrapper;
