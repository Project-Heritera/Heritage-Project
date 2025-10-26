import { useState } from "react";
import { CirclePlus, List } from "lucide-react";
import "../styles/pages/room_editor.css";

const RoomEditor = () => {
  return (
    <>
      <div className="room-editor flex flex-col">
        <div className="room-editor-header flex justify-center items-cente h-[10%]">
            <img src="  .\src\assets\logos\heritera_white_logo.png" alt="Heritera Logo" />
            <h1>Editor</h1>
          <button>
            <List />
          </button>
        </div>
        <div className="room-editor-body">
          <div className="task-editor flex flex-col">
            <div className="task flex flex-col">
              <div className="task-component"></div>
              <button className="add-task-component">
                <CirclePlus />
              </button>
            </div>
            <button className="add-task">
              <CirclePlus />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomEditor;
