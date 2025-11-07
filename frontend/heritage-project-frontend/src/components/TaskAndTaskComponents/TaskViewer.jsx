import { useState, forwardRef, useImperativeHandle } from "react";
import TaskBase from "./TaskBase";

const TaskViewer = forwardRef(({ taskData }, ref) => {
  const [attemptsLeft, setAttemptsLeft] = useState(taskData.numOfChances ?? 1);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const checkIfCorrect = () => {
    // Run "checkIfCorrect" on all components (pseudo-code)
    const results = taskData.components.map((comp) => comp.ref?.checkIfCorrect?.());
    const allCorrect = results.every(Boolean);
    setIsCorrect(allCorrect);
    setIsComplete(true);
    return allCorrect;
  };

  useImperativeHandle(ref, () => ({
    serialize: () => ({
      attemptsLeft,
      isCorrect,
      isComplete,
    }),
  }));

  const contextValues = {
    attemptsLeft,
    setAttemptsLeft,
    isCorrect,
    setIsCorrect,
    showHint,
    setShowHint,
    isComplete,
    setIsComplete,
  };

  return (
    <div className="task-viewer">
      <h3>Quiz</h3>
      <TaskBase
        components={taskData.components}
        isEditing={false}
        contextValues={contextValues}
      />
      <button onClick={checkIfCorrect}>Submit</button>
    </div>
  );
});

export default TaskViewer;
