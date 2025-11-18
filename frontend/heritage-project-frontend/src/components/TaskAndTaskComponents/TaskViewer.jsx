import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import statusTypes from "../../utils/statusTypes";
import "../../styles/Components/TaskViewer.css";

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
      // Always render the task base
      const taskBaseComponent = (
        <TaskBase
          components={taskComponents}
          isEditing={false}
          contextValues={contextValues}
        />
      );

      // Render overlay badge for complete/incomplete status
      let statusOverlay = null;
      if (taskStatus === statusTypes.COMPLE) {
        statusOverlay = (
          <div className="task-status-overlay task-complete-overlay">
            <div className="status-badge">
              <div className="status-icon">✓</div>
              <div className="status-text">Task Complete</div>
            </div>
          </div>
        );
      } else if (taskStatus === statusTypes.INCOMP) {
        statusOverlay = (
          <div className="task-status-overlay task-incomplete-overlay">
            <div className="status-badge">
              <div className="status-icon">✗</div>
              <div className="status-text">Try Again</div>
            </div>
          </div>
        );
      }

      // Return task with optional overlay on top
      return (
        <div className="task-content-wrapper">
          {taskBaseComponent}
          {statusOverlay}
        </div>
      );
    };

    return <div className="task-viewer">{renderContent()}</div>;
  }
);

export default TaskViewer;
