import { useState, forwardRef, useImperativeHandle } from "react";
import { CirclePlus } from "lucide-react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";

const TaskEditor = forwardRef(({ tags = [], initialComponents = [] }, ref) => {
  const [taskComponents, setTaskComponents] = useState(initialComponents);
  const [taskComponentMenu, setTaskComponentMenu] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);

  const addNewTaskComponent = (type) => {
    const jsonData = taskComponentTypes[type].defaultValue;
    const newComponent = {
      task_component_id: Date.now(),
      type,
      content: jsonData,
    };
    setTaskComponents((prev) => [...prev, newComponent]);
  };

  useImperativeHandle(ref, () => ({
    serialize: () => taskComponents,
  }));

  return (
    <div className="task-editor">
      <h3>Task Editor</h3>
      <p>Tags: {tags.join(", ")}</p>

      <TaskBase
        components={taskComponents}
        isEditing={true}
        contextValues={{ taskStatus, setTaskStatus }}
      />

      <button onClick={() => setTaskComponentMenu(true)}>
        <CirclePlus /> Add Task Component
      </button>

      <Modal isOpen={taskComponentMenu} onClose={() => setTaskComponentMenu(false)}>
        <TaskComponentMenu onSelect={addNewTaskComponent} />
      </Modal>
    </div>
  );
});

export default TaskEditor;
