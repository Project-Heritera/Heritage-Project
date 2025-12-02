import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { CirclePlus } from "lucide-react";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import TaskBase from "./TaskBase";
import Modal from "../Modal";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskComponentMenu } from "./TaskComponentMenu";
import { TagSelectionMenu } from "./TagSelectionMenu";

const TaskEditor = forwardRef(
  ({ initialTags, initialComponents = [], taskID }, ref) => {
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    const [taskComponentMenu, setTaskComponentMenu] = useState(false);
    //for tags
    const [tags, setTags] = useState(initialTags?? []);
    const [availableTags, setAvailableTags] = useState([
      "Easy",
      "Medium",
      "Hard",
    ]); //todo: load all from database onto global zustland state on user login
    const [tagSelectionMenu, setTagSelectionMenu] = useState(false);
    const taskBaseRef = useRef(null);

  useImperativeHandle(ref, () => ({
serialize: () => {
    if (!taskBaseRef.current?.serialize) {
      console.warn("TaskBase ref not ready or serialize not defined");
      return {
        task_id: taskID,
        tags,
        components: []
      };
    }

    // Call TaskBase's serialize() which returns an array of components
    const components = taskBaseRef.current.serialize();

    const t = {
      task_id: taskID,
      tags: Array.isArray(tags) ? tags : [],
      components: Array.isArray(components) ? components : []
    };

    console.log("inside TaskEditor.serialize()", t);

    return t;
  }
  }));

      
    const addNewTaskComponent = (type) => {
      const jsonData = taskComponentTypes[type].defaultValue;
      const newComponent = {
        task_component_id: Date.now(),
        type,
        content: jsonData,
      };
      setTaskComponents((prev) => [...prev, newComponent]);
    };

    return (
      <Card className="task-editor bg-white/5 backdrop-blur-lg border border-white/15 rounded-xl shadow-sm p-4">
        {/* Tag Section */}
        <CardHeader className="pb-2">
          <h3 className="text-lg font-bold">Tags</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Display current tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-indigo-100/60 text-indigo-700 px-3 py-1 rounded-full gap-1"
              >
                <span>{tag}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-indigo-500 hover:text-indigo-700 p-0"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* Add Tag Button */}
          <Button
            onClick={() => setTagSelectionMenu(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <CirclePlus className="w-4 h-4" />
            Add Tag
          </Button>

          {/* Tag Selection Modal */}
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
                setTagSelectionMenu(false);
              }}
              onClose={() => setTagSelectionMenu(false)}
              tagCatalogue={availableTags}
            />
          </Modal>
        </CardContent>

        {/* Task Components Section */}
        <CardHeader className="pt-4 pb-2">
          <h3 className="text-lg font-bold">Task Components</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TaskBase components={taskComponents} isEditing={true} ref={(el) => (taskBaseRef.current = el)} />

          {/* Add Task Component Button */}
          <Button
            onClick={() => setTaskComponentMenu(true)}
            className="flex items-center gap-1"
          >
            <CirclePlus className="w-4 h-4" />
            Add Task Component
          </Button>

          {/* Task Component Modal */}
          <Modal
            isOpen={taskComponentMenu}
            onClose={() => setTaskComponentMenu(false)}
          >
            <TaskComponentMenu
              onSelect={addNewTaskComponent}
              onClose={() => setTaskComponentMenu(false)}
            />
          </Modal>
        </CardContent>
      </Card>
    );
  }
);

export default TaskEditor;
