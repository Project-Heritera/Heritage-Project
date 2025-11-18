import { useState, forwardRef, useImperativeHandle } from "react";
import { CirclePlus } from "lucide-react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";
import { TagSelectionMenu } from "./TagSelectionMenu";

const TaskEditor = forwardRef(({ initialTags = [], initialComponents = [] }, ref) => {
  const [taskComponents, setTaskComponents] = useState(initialComponents);
  const [taskComponentMenu, setTaskComponentMenu] = useState(false);
  //for tags
  const [tags, setTags] = useState(initialTags);
  const [availableTags, setAvailableTags] = useState(["Easy", "Medium", "Hard"]) //todo: load all from database onto global zustland state on user login 
  const [tagSelectionMenu, setTagSelectionMenu] = useState(false);

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
<div className="tag-view">
  {/* Display current tags with delete buttons */}
  <div className="flex flex-wrap gap-2 mb-2">
    {tags.map((tag, index) => (
      <div
        key={index}
        className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full gap-1"
      >
        <span>{tag}</span>
        <button
          onClick={() => setTags(tags.filter((t) => t !== tag))}
          className="font-bold text-indigo-500 hover:text-indigo-700"
        >
          ×
        </button>
      </div>
    ))}
  </div>

  {/* Add Tag Button */}
  <button
    className="add-tag flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    onClick={() => setTagSelectionMenu(true)}
  >
    <CirclePlus />
    Add Tag
  </button>

  {/* Tag selection modal */}
  <Modal
    isOpen={tagSelectionMenu}
    onClose={() => setTagSelectionMenu(false)}
    animationType="slide"
  >
    <TagSelectionMenu
      onSelect={(selectedTag) => {
        if (!tags.includes(selectedTag)) {
          setTags([...tags, selectedTag]);
        }
        setTagSelectionMenu(false); // close modal after selection
      }}
      onClose={() => setTagSelectionMenu(false)}
      tagCatalogue={availableTags}
    />
  </Modal>
</div>

<div className="task-body">
      <TaskBase
        components={taskComponents}
        isEditing={true}
        />
        </div>
        <div className="add-task-component">

      <button onClick={() => setTaskComponentMenu(true)}>
        <CirclePlus /> Add Task Component
      </button>

      <Modal isOpen={taskComponentMenu} onClose={() => setTaskComponentMenu(false)}>
        <TaskComponentMenu onSelect={addNewTaskComponent} />
      </Modal>
        </div>
    </div>
  );
});

export default TaskEditor;
