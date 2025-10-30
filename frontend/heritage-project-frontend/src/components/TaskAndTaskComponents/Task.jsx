import PropTypes from "prop-types";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { useState, forwardRef, useImperativeHandle } from "react";
import { CirclePlus } from "lucide-react";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";
import TaskComponent from "./TaskComponent";

const Task = forwardRef(
  ({ pointValue = 0, tags = [], initialComponents = [] }, ref) => {
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    const [taskComponentMenu, setTaskComponentMenu] = useState(false);
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

    return (
      <div>
        <h3>Task</h3>
        <p>Tags: {tags.join(", ")}</p>
        <p>Point Value: {pointValue}</p>
        <div className="task-body">
          {taskComponents.map((tc) => {
            const Component = taskComponentTypes[tc.type].component;
            return (
              <TaskComponent
                key={tc.task_component_id}
                componentType={tc.type}
                taskComponentSpecificData={tc.content}
                isEditing={true}
                ref={(el) => {
                  tc.ref = el;
                }}
                />
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
  pointValue: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialComponents: PropTypes.array,
};;
export default Task;
