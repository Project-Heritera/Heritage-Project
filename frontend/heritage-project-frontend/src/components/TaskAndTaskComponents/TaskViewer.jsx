import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import statusTypes from "../../utils/statusTypes";

const TaskViewer = forwardRef(
  (
    {
      intialStatus,
      initialComponents = [],
      initialAttempts = 1,
      initialMetadata = {},
      taskId,
    },
    ref
  ) => {
    //do dynamically load tasks
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    //specifics for viewer
    const [attempts, setAttempts] = useState(initialAttempts);
    const [metadata, setMetadata] = useState(initialMetadata);
    const [taskStatus, setTaskStatus] = useState(intialStatus);
    //influences component behavior if no question task component is present in task
    const [questionTaskPresent, setQuestionTaskPresent] = useState(false);

    //check if any task components are question types
    useEffect(() => {
      const hasQuestion = taskComponents.some(
        (tc) => taskComponentTypes[tc.type]?.category === "Question"
      );
      console.log("does task have a question component", hasQuestion);
      setQuestionTaskPresent(hasQuestion);
    }, [taskComponents]);

    useImperativeHandle(ref, () => ({
      serialize: () => {
        let taskData = {
          status: taskStatus,
          attempts: attempts,
          metadata: metadata,
          task: taskId,
        };
        return taskData;
      },
    }));

    const contextValues = {
      taskStatus,
      setTaskStatus,
    };

    // Render different content based on taskStatus
    const renderContent = () => {
      if (taskStatus === statusTypes.COMPLE) {
        return (
          <div className="task-complete">
            <h3>✓ Task Complete</h3>
            <p>You have successfully completed this task!</p>
          </div>
        );
      } else if (taskStatus === statusTypes.INCOMP) {
        return (
          <div className="task-incomplete">
            <h3>✗ Incorrect Answer</h3>
            <p>Please try again.</p>
            <TaskBase
              components={taskComponents}
              isEditing={false}
              contextValues={contextValues}
            />
          </div>
        );
      } else {
        // NOSTAR or null - show the task normally
        return (
          <TaskBase
            components={taskComponents}
            isEditing={false}
            contextValues={contextValues}
          />
        );
      }
    };

    return <div className="task-viewer">{renderContent()}</div>;
  }
);

export default TaskViewer;
