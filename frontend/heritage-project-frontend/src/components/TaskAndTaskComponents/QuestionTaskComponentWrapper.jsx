import { useState, useContext, useEffect } from "react";
import statusTypes from "../../utils/statusTypes";
import { GlobalStateContext } from "./Task";

function QuestionTaskComponentWrapper({ jsonData,  QuestionTaskComponent, isEditing, serialize }) {
  const [attemptsLeft, setAttemptsLeft] = useState(jsonData.numOfChances ?? 1);
  const [hint, setHind] = useState(jsonData.hint ?? "")
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const {roomStatus, setRoomStatus, runHandleSubmit, setRunHandleSubmit} = useContext(GlobalStateContext)//states from task

  useEffect(() => {
    if (runHandleSubmit) {
      handleSubmit();
      // reset the trigger so it doesn’t run again immediately
      setRunHandleSubmit(false);
    }
  }, [runHandleSubmit]); // only runs when runHandleSubmit changes in task

  const handleSubmit = () => {
    const result = QuestionTaskComponent.checkIfCorrect();//pass down to question task component (mcq, input)
    setRoomStatus(result)
  };
  

  return (
    <div className="question-wrapper">
      <QuestionTaskComponent
        jsonData={jsonData}
        isEditing={isEditing}
        serialize={serialize}
      />
      {!isCorrect && attemptsLeft === 0 && jsonData.hint && (
        <p className="hint">{jsonData.hint}</p>
      )}
      {showHint && <p className="hint">{jsonData.hint}</p>}
    </div>
  );
}

export default QuestionTaskComponentWrapper;
