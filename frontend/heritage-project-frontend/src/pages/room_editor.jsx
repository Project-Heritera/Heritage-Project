import { useEffect, useState, useRef } from "react";
import { CirclePlus, List, Save } from "lucide-react";
import "../styles/pages/room_editor.css";
import { DndContext } from "@dnd-kit/core";
import Task from "../components/TaskAndTaskComponents/Task";
import { taskComponentTypes } from "../utils/taskComponentTypes";
import TaskComponent from "../components/TaskAndTaskComponents/TaskComponent";
import { get_room_data, get_test_room } from "../services/room";
import { v4 as uuidv4 } from "uuid";

const RoomEditor = () => {
  const [roomTitle, setRoomTitle] = useState("Untitled Room");
  const [roomDesc, setRoomDesc] = useState("No Description");
  const [roomCreator, setRoomCreator] = useState("No Creator");
  const [roomTasks, setRoomTasks] = useState([]);
  const [roomCreationDate, setRoomCreationDate] = useState("Unavailable");
  const [roomLastEdited, setRoomLastEdited] = useState("Unavailable");

  const [draggedIndex, setDraggedIndex] = useState(null);

  // Store refs for all task components
  const taskComponentRefs = useRef({});

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const room_data = await get_test_room();
        if (!room_data) {
          console.error(
            "Room editing page entered but room id has no is editing field"
          );
          return;
        }
        Debug.log("room data: ", room_data);
        if (room_data["editing_mode"] !== true) {
          console.warn(
            "Editing page reached and room data doesn't have editing_mode set to true"
          );
        }
        if (room_data.title) {
          setRoomTitle(room_data.title);
        }
        if (room_data.description) {
          setRoomDesc(room_data.description);
        }
        //load username from creator field and set room creater state
        //else set state to user_unavailable
        const tasks = Array.isArray(room_data.metadata?.tasks)
          ? room_data.metadata.tasks
          : [];
        const normalizedTasks = tasks.map((task) => ({
          ...task,
          task_id: task.task_id || uuidv4(),
          task_components: Array.isArray(task.task_components)
            ? task.task_components.map((tc) => ({
                ...tc,
                task_component_id: tc.task_component_id || uuidv4(), // sometimes task doesn't have id
              }))
            : [],
        }));
        setRoomTasks(normalizedTasks);
      } catch (err) {
        console.error("Failed to load room data", err);
      }
    };

    loadRoom();
  }, []);

  const addNewTask = () => {
    const newTask = {
      task_id: uuidv4(),
      pointValue: 1,
      tags: [],
      task_components: [],
    };
    setRoomTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (taskId) => {
    setRoomTasks((prev) => prev.filter((task) => task.task_id !== taskId));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newCards = [...roomTasks];
    const draggedCard = newCards[draggedIndex];

    newCards.splice(draggedIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);

    setRoomTasks(newCards);
    setDraggedIndex(null);
  };
  // Function to serialize everything to ever exist
  const serializeAllTasks = () => {
    try {
      const serializedRoom = {
        title: roomTitle,
        description: roomDesc,
        creator: roomCreator,
        creationDate: roomCreationDate,
        lastEdited: new Date().toISOString(),
        tasks: [],
      };

      // go through all tasks
      for (const task of roomTasks) {
        const serializedTask = {
          task_id: task.task_id,
          pointValue: task.pointValue,
          tags: task.tags,
          task_components: [],
        };

        //go through each task component
        for (const taskComponent of task.task_components) {
          const ref =
            taskComponentRefs.current[taskComponent.task_component_id];

          if (ref && ref.serialize) {
            try {
              const serializedData = ref.serialize();
              if (serializedData) {
                serializedTask.task_components.push({
                  task_component_id: taskComponent.task_component_id,
                  type: serializedData.componentType,
                  metadata: serializedData.data,
                });
              }
            } catch (err) {
              console.error(
                `Failed to serialize component ${taskComponent.task_component_id}:`,
                err
              );
            }
          }
        }

        serializedRoom.tasks.push(serializedTask);
      }

      console.log("Serialized Room Data:", serializedRoom);

      alert("Room serialized successfully! Check console for details.");
      return serializedRoom;
    } catch (err) {
      console.error("Failed to serialize room:", err);
      alert("Failed to serialize room. Check console for errors.");
      return null;
    }
  };

  return (
    <div className="room-editor flex flex-col px-8 py-6 gap-6">
      <div className="room-editor-header space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor for Room: {roomTitle}</h1>
            <p className="text-base">{roomDesc}</p>
            <p className="text-sm italic">{roomCreator}</p>
          </div>

          <button
            onClick={serializeAllTasks}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Save className="w-5 h-5" />
            <span className="font-medium">Save Room</span>
          </button>
        </div>
      </div>

      <div className="room-editor-body">
        <div className="task-editor flex flex-col gap-6">
          {roomTasks.map((task, taskIndex) => (
            <div
              key={task.task_id}
              className="rounded-lg border border-gray-300 p-4 shadow-sm space-y-4"
            >
              <Task
                index={taskIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                pointValue={task.pointValue}
                tags={task.tags}
              >
                <div className="flex flex-col gap-4">
                  {task.task_components.map((taskComponent, index) => (
                    <TaskComponent
                      index={index}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedIndex}
                      key={taskComponent.task_component_id}
                      ref={(el) => {
                        if (el) {
                          taskComponentRefs.current[
                            taskComponent.task_component_id
                          ] = el;
                        }
                      }}
                      componentType={taskComponent.type}
                      taskComponentSpecificData={taskComponent.metadata}
                      isEditing={true}
                    />
                  ))}
                </div>
              </Task>

              <button
                onClick={() => deleteTask(task.task_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                Delete Task
              </button>
            </div>
          ))}

          <button
            className="add-task flex items-center gap-2 rounded-md px-4 py-2 border border-dashed hover:border-gray-600 transition"
            onClick={addNewTask}
          >
            <CirclePlus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Task</span>
          </button>
        </div>
      </div>

      <div className="room_modification_info text-sm text-gray-500 mt-6">
        <p>Created On {roomCreationDate}</p>
        <p>Last Modified On {roomLastEdited}</p>
      </div>
    </div>
  );
};

export default RoomEditor;
