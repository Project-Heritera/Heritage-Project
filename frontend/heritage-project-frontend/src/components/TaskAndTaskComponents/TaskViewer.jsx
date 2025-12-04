import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import statusTypes, { statusDisplayToKey } from "../../utils/statusTypes";
import confetti from "canvas-confetti";
const TaskViewer = forwardRef(
  (
    {
      initialStatus,
      initialComponents = [],
      initialAttempts = 1,
      initialMetadata = {},
      taskID,
    },
    ref
  ) => {
    //do dynamically load tasks
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    //specifics for viewer
    const [attempts, setAttempts] = useState(initialAttempts);
    const [metadata, setMetadata] = useState(initialMetadata);

    // Normalize incoming status (accept either key like 'COMPLE' or display like 'COMPLETE')
    const getStatusKey = (s) => {
      if (!s) return null;
      // if s is already a key (e.g. 'COMPLE') and exists in statusTypes, return it
      if (Object.prototype.hasOwnProperty.call(statusTypes, s)) return s;
      // if s is a display string (e.g. 'COMPLETE'), map to key
      if (statusDisplayToKey && statusDisplayToKey[s]) return statusDisplayToKey[s];
      return null;
    };

    // store canonical status key in state (e.g. 'COMPLE')
    const [taskStatus, setTaskStatusState] = useState(getStatusKey(initialStatus) ?? "NOSTAR");

    // Expose a setter that accepts either display or key and normalizes to the canonical key
    const setTaskStatus = (val) => {
      const k = getStatusKey(val);
      if (k) setTaskStatusState(k);
    };
    //influences component behavior if no question task component is present in task
    const [questionTaskPresent, setQuestionTaskPresent] = useState(false);

    //check if any task components are question types
    useEffect(() => {
      const hasQuestion = taskComponents.some(
        (tc) => taskComponentTypes[tc.type]?.category === "Question"
      );
      setQuestionTaskPresent(hasQuestion);
    }, [taskComponents]);

    const contextValues = {
      taskStatus,
      setTaskStatus,
    };


    useEffect(() => {
      if (taskStatus === "COMPLE") {
        confetti({
          particleCount: 20,
          spread: 60,
          origin: { y: 1 }
        });
      }
    }, [taskStatus]);
    // Render different content based on taskStatus
    const renderContent = () => {
      const questionProgressData = {
        attempts: attempts,
        status: taskStatus,
        metadata: metadata,
      };
      if (taskStatus === "COMPLE") {
        return (
          
          <div className="task-complete">
            <h3>✓ Task Complete</h3>
            <p>You have successfully completed this task!</p>
          </div>
        );
      } else if (taskStatus === "INCOMP") {
        return (
          <div className="task-incomplete">
            <h3>✗ Incorrect Answer</h3>
            <p>Please try again.</p>
            <TaskBase
              components={taskComponents}
              isEditing={false}
              contextValues={contextValues}
              taskID={taskID}
              questionProgressData={questionProgressData}
            />
          </div>
        );
      } else {
        // NOSTAR or null - show the task normally
        return (
          <TaskBase
            components={taskComponents}
            isEditing={false}
            taskID={taskID}
            contextValues={contextValues}
            questionProgressData={questionProgressData}
          />
        );
      }
    };

    return <div className="task-viewer">{renderContent()}</div>;
  }
);

export default TaskViewer;
