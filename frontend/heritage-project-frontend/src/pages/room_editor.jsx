import { useState } from "react";
import { CirclePlus, List } from "lucide-react";
import "../styles/pages/room_editor.css";
import {DndContext} from "@dnd-kit/core";
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
              </div>
              <button className="add-task-component">
              </button>
            </div>
            <button className="add-task">
              <CirclePlus />
            </button>
          </div>
                <CirclePlus />
        </div>
      </div>
    </>
  );
};

export default RoomEditor;
