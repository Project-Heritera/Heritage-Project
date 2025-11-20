import { createContext } from "react";
import TaskComponent from "./TaskComponent";

export const TaskGlobalContext = createContext(null);

export default function TaskBase({ components, isEditing, contextValues={}, taskID, questionProgressData}) {
  return (
    <TaskGlobalContext.Provider value={contextValues}>
      <div className="task-body">
        {components.map((tc) => (
          <TaskComponent
            key={tc.task_component_id}
            componentType={tc.type}
            taskComponentSpecificData={tc.content}
            isEditing={isEditing}
            taskID={taskID}
questionProgressData={questionProgressData}
          />
        ))}
      </div>
    </TaskGlobalContext.Provider>
  );
}
