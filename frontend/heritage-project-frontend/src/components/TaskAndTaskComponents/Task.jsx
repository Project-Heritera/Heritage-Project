import PropTypes from "prop-types";
import { taskComponentTypes} from "../../utils/taskComponentTypes";
import { useEffect, useRef, useState } from "react";
import { CirclePlus } from "lucide-react";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";
Task.propTypes = {
  pointValue: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};

function Task({ pointValue = 0, tags, children }) {
  const taskComponents = useRef([]);
  const [taskComponentMenu, setTaskComponentMenu] = useState(false);
  const childrenWithRefs = Array.isArray(children)
    ? children.map((child, i) =>
        child
          ? { ...child, ref: (el) => (taskComponents.current[i] = el) }
          : null
      )
    : children;
  const addNewTaskComponent = (taskComponentTypeToAdd) => {
    //get jsonData from defaults provided in enums file
    const jsonData = taskComponentTypeToAdd.defaultValue 
    //create component and append to list
    const NewComponent = taskComponentTypeToAdd.component; // assuming your enum maps to React component
    const newElement = (
      <NewComponent
        key={Date.now()} // ensure unique key
        {...jsonData}
        ref={(el) => taskComponents.current.push(el)}
      />
    );  
  };
  const saveChildren = () => {
    const serialized = taskComponents.current.map((ref) => ref?.serialize());
    //no need to error check here since serialize all in editor page does so
    Debug.log("Serialized children:", serialized);
    return serialized;
  };

  return (
    <div>
      <h3>Task</h3>
      <p>Tags: {tags.join(", ")}</p>
      <p>Point Value: {pointValue}</p>
      <div className="task-body">{childrenWithRefs}</div>
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
            addNewTaskComponent(taskComponentTypes[templateKey])
          }}
          onClose={() => {
            setTaskComponentMenu(false);
          }}
        />
      </Modal>
    </div>
  );
}

export default Task;
