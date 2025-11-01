import PropTypes from "prop-types";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { useState, forwardRef, useImperativeHandle } from "react";
import { CirclePlus } from "lucide-react";
import Modal from "../Modal";
import { TaskComponentMenu } from "./TaskComponentMenu";
import TaskComponent from "./TaskComponent";
import { TagSelectionMenu } from "./TagSelectionMenu";

const Task = forwardRef(
  (
    { initialPointValue = 0, initialTags = [], initialComponents = [] },
    ref
  ) => {
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    const [taskComponentMenu, setTaskComponentMenu] = useState(false); //opens modal
    const [tags, setTags] = useState(initialTags);
    const [availableTags, setAvailableTags] = useState([
      "easy",
      "medium",
      "hard",
    ]); //todo: dynamically fill with available tags in database
    const [tagSelectionMenu, setTagSelectionMenu] = useState(false); //opens modal
    const [pointValue, setPointValue] = useState(initialPointValue);
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
        let taskData = {
          point_value: pointValue,
          tags: tags,
          components: taskComponents.map((c) => (c.serialize ? c.serialize() : c))
        }
        //choosing not to send id since we are overwriting all tasks so it will be generated on backend
        return taskData;
      },
    }));

    return (
      <div>
        {/* Edit point value */}
        <h2>Point Value:</h2>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pointValue}
          onChange={(e) => {
            setPointValue(e.target.value);
          }}
          placeholder="Enter a Point Value"
        />
        <div className="tag-view">
          <h2>Tags</h2>
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
          {/*Add a new tag*/}
          <button className="add-tag" onClick={() => setTagSelectionMenu(true)}>
            <CirclePlus />
            Add Tag
          </button>
          <Modal
            isOpen={tagSelectionMenu}
            onClose={() => {}}
            animationType="slide"
          >
            <TagSelectionMenu
              onSelect={(selectedTag) => {
                if (!tags.includes(selectedTag)) {
                  setTags([...tags, selectedTag]);
                }
              }}
              onClose={() => {
                setTagSelectionMenu(false);
              }}
              tagCatalogue={availableTags}
            />
          </Modal>
        </div>
        <div className="task-body">
          <h2>Task Components</h2>
          {taskComponents.map((tc) => {
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
);
Task.propTypes = {
  pointValue: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialComponents: PropTypes.array,
};
export default Task;
