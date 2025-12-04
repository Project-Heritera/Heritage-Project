import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { CheckCircle, XCircle } from "lucide-react";
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

  // CASE 1: Completed
  if (taskStatus === "COMPLE") {
    return (
      <div className="relative pt-10">
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg shadow-md text-sm font-semibold">
          <CheckCircle size={32} />
          Complete
        </div>
        <div>
        <TaskBase
          components={taskComponents}
          isEditing={false}
          contextValues={contextValues}
          taskID={taskID}
          questionProgressData={questionProgressData}
        />
        </div>
      </div>
    );
  }

  // CASE 2: Incomplete
  if (taskStatus === "INCOMP") {
    return (
         <div className="relative pt-10">
        {/* STATUS BADGE */}
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg shadow-md text-sm font-semibold">
          <XCircle size={32} />
          Incorrect
        </div>
        <div>

        <TaskBase
          components={taskComponents}
          isEditing={false}
          contextValues={contextValues}
          taskID={taskID}
          questionProgressData={questionProgressData}
        />
        </div>
      </div>
    );
  }

  // CASE 3: Default
  return (
    <TaskBase
      components={taskComponents}
      isEditing={false}
      contextValues={contextValues}
      taskID={taskID}
      questionProgressData={questionProgressData}
    />
  );
};
return <div className="task-viewer">{renderContent()}</div>;

  }
);



export default TaskViewer;
