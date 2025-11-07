import { useState, forwardRef, useImperativeHandle } from "react";
import TaskBase from "./TaskBase";

const TaskViewer = forwardRef(
  (
    { intialStatus, initialComponents = [], initialAttempts, initialMetadata },
    ref
  ) => {
    const [attemptsLeft, setAttemptsLeft] = useState(
      taskData.numOfChances ?? 1
    );

    //do dynamically load tasks
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    //specifics for viewer
    const [attempts, setAttempts] = useState(initialAttempts);
    const [metadata, setMetadata] = useState(initialMetadata);
    const [taskStatus, setTaskStatus] = useState(intialStatus);
    //influences component behavior if no question task component is present in task
    const [questionTaskPresent, setQuestionTaskPresent] = useState(false);
    //for checking if user input in question component is correct
    const [runHandleSubmit, setRunHandleSubmit] = useState(false);

    //check if any task comopenents are question types 
 useEffect(() => {
      const hasQuestion = taskComponents.some(
        (tc) => taskComponentTypes[tc.type]?.category === "question"
      );
      setQuestionTaskPresent(hasQuestion);
    }, [taskComponents]);

    function updateTaskState() {
      setRunHandleSubmit(true); //calls function in task component that acts as question
    }

    useImperativeHandle(ref, () => ({
      serialize: () => {
        let taskData = {
          status: taskStatus,
          attempts: attempts,
          metadata: metadata,
          task: taskId, //todo: find out how to reference same task when updated progress of task
        };
        //choosing not to send id since we are overwriting all tasks so it will be generated on backend
        return taskData;
      },
    }));

    const contextValues = {
      runHandleSubmit,
      setRunHandleSubmit,
      taskStatus,
      setTaskStatus,
    };

    return (
      <div className="task-viewer">
        <h3>Quiz</h3>
        <TaskBase
          components={taskComponents}
          isEditing={false}
          contextValues={contextValues}
        />
        <div className="submit-button">
        {questionTaskPresent && <button onClick={updateTaskState}>Submit</button>}
        </div>
      </div>
    );
  }
);

export default TaskViewer;
