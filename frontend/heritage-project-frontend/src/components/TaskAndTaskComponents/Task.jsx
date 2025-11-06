import PropTypes from "prop-types";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { useState, forwardRef, useImperativeHandle, createContext } from "react";
import { CirclePlus, Users } from "lucide-react";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";
import TaskComponent from "./TaskComponent";
import statusTypes from "../../utils/statusTypes";

const TaskGlobalContext = createContext(null);
const Task = forwardRef(
  ({ tags = [], initialComponents = [] }, ref) => {
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    const [taskComponentMenu, setTaskComponentMenu] = useState(false);
    const [taskStatus, setTaskStatus] = useState(null);
    const [runHandleSubmit, setRunHandleSubmit] = useState(false)

    const addNewTaskComponent = (taskComponentTypeToAdd) => {
      //get jsonData from defaults provided in enums file
      const jsonData = taskComponentTypes[taskComponentTypeToAdd].defaultValue;
      //create component and append to list
      const newId = Date.now();
      const newTaskComponent = {
        task_component_id: newId,
        type: taskComponentTypeToAdd,
        content: jsonData,
  };
      setTaskComponents((prev) => [...prev, newTaskComponent]);
    };
    useImperativeHandle(ref, () => ({
      serialize: () => {
        return taskComponents.map((c) => (c.serialize ? c.serialize() : c));
      },
    }));
    function updateTaskState(){
      console.log("status before", taskStatus)
      setRunHandleSubmit(true) //calls function in task component that acts as question
      console.log("status after", taskStatus)
    }

    return (
      <div>
        <h3>Task</h3>
        <p>Tags: {tags.join(", ")}</p>
        <div className="task-body">
          {taskComponents.map((tc) => {
            return (
              <>
              <TaskGlobalContext.Provider key={tc.task_component_id} value={{taskStatus, setTaskStatus, runHandleSubmit, setRunHandleSubmit}}>
              <TaskComponent
                componentType={tc.type}
                taskComponentSpecificData={tc.content}
                isEditing={true}
                ref={(el) => {
                  tc.ref = el;
                }}
                />
                </TaskGlobalContext.Provider>
                </>
            );
          })}
        </div>
        <button
          className="add-task-component"
          onClick={() => setTaskComponentMenu(true)}
        >
          <CirclePlus />
          Add Task Component
        </button>
        <Modal
          isOpen={taskComponentMenu}
          onClose={() => {}}
          animationType="slide"
        >
          <TaskComponentMenu
            onSelect={(templateKey) => {
              addNewTaskComponent(templateKey);
            }}
            onClose={() => {
              setTaskComponentMenu(false);
            }}
          />
        </Modal>
      </div>
    );
  }
)
Task.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialComponents: PropTypes.array,
};
export { TaskGlobalContext as GlobalStateContext };
export default Task;
