import {useRef, useImperativeHandle, createContext, forwardRef } from "react";
import TaskComponent from "./TaskComponent";

export const TaskGlobalContext = createContext(null);

const TaskBase = forwardRef(({ components, isEditing, contextValues={}, taskID, questionProgressData}, ref) => {
  
  const componentRefs = useRef([]);

  useImperativeHandle(ref, () => ({
   serialize: () => {
    console.log("in serialize in task base")
  return componentRefs.current
    .map((ref) => ref?.serialize?.())
    .filter(Boolean);
} 
    }));


  return (
    <TaskGlobalContext.Provider value={contextValues}>
      <div className="task-body space-y-6">
        {components.map((tc, index) => (
          <TaskComponent
            key={tc.task_component_id}
            componentType={tc.type}
            taskComponentSpecificData={tc.content}
            isEditing={isEditing}
            taskID={taskID}
questionProgressData={questionProgressData}
    ref={(el) => (componentRefs.current[index] = el)} 
          />
        ))}
      </div>
    </TaskGlobalContext.Provider>
  );
}
);
export default TaskBase
