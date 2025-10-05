import { useState } from "react";
import { CirclePlus, List } from "lucide-react";
import "../styles/pages/room_editor.css";
import {DndContext} from "@dnd-kit/core";
import Task from "../components/TaskAndTaskComponents/Task";
import { taskComponentTypes } from "../utils/taskComponentTypes";
import TaskComponent from "../components/TaskAndTaskComponents/TaskComponent";
const RoomEditor = () => {
  return (
    <>
      <div className="room-editor flex flex-col">
        <div className="room-editor-header flex justify-center items-cente h-[10%]">
            <h1>Editor</h1>
        </div>
        <div className="room-editor-body">
          <div className="task-editor flex flex-col">
            <div className="task flex flex-col">
              <div className="task-component">
                <Task pointValue={1} tags={["tag1", "tag2"]}>
                <TaskComponent componentType={taskComponentTypes.TEXT} taskComponentSpecificData={'{"text": "hi"}'} isEditing={true}/>
                </Task>
                <Task pointValue={0} tags={["tag1"]}>
                <TaskComponent componentType={taskComponentTypes.TEXT} taskComponentSpecificData={'{"text": "hi"}'} isEditing={true}/>
                </Task>
              </div>
           </div>
            <button className="add-task">
              <CirclePlus />
              Add task
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomEditor;
