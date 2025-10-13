import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { CirclePlus, List } from "lucide-react";
import "../styles/pages/room_editor.css";
import {DndContext} from "@dnd-kit/core";
import Task from "../components/TaskAndTaskComponents/Task";
import { taskComponentTypes } from "../utils/taskComponentTypes";
import TaskComponent from "../components/TaskAndTaskComponents/TaskComponent";
import {get_room_data, get_test_room} from "../services/room";
const RoomEditor = () => {
  //get ids fro url
  const { course_id, section_id, room_id } = useParams();
  //locals
  const [roomTitle,setRoomTitle] = useState("Untitled Room");
  const [roomDesc,setRoomDesc] = useState("No Description");
  const [roomCreator,setRoomCreator] = useState("No Creator");
  const [roomTasks,setRoomTasks] = useState([]);
  const [roomCreationDate,setRoomCreationDate] = useState("Unavailable");
  const [roomLastEdited,setRoomLastEdited] = useState("Unavailable");
  useEffect(()=>{
    const loadRoom = async () => {
      try {
        const room_data = await get_room_data(course_id, section_id, room_id);
        if (!room_data) {
          console.error("Room editing page entered but room id has no is editing field");
          return;
        }
        Debug.log("room data: ", room_data); 
        //dont load page if room dosent have can edit set to true
        if (room_data["can_edit"] !== true) {
          console.error("Editing page reached and room data doesn't have editing_mode set to true");
        }
        if (room_data.title){
          setRoomTitle(room_data.title);
        }
        if (room_data.description){
          setRoomDesc(room_data.description);
        }
        if (room_data.last_updated){
          setRoomLastEdited(room_data.last_updated);
        }
        if (room_data.created_on){
          setRoomCreationDate(room_data.created_on);
        }
        if (room_data.creator){
          setRoomCreator(room_data.creator);
        }
        //load username from creator field and set room creater state
        //else set state to user_unavailable 
        const tasks = Array.isArray(room_data.tasks) ? room_data.tasks: [];
        const normalizedTasks = tasks.map((task) => ({
          ...task,
          task_components: Array.isArray(task.task_components)? task.task_components: [],
        }));
        setRoomTasks(normalizedTasks);
      } catch (err) {
        console.error("Failed to load room data", err);
      }
    };

    loadRoom();
  },[]);

 
  return (
    <>
      <div className="room-editor flex flex-col">
        <div className="room-editor-header flex flex-col justify-center">
            <h1>Editor for Room: {roomTitle}</h1>
            <p>Description: {roomDesc}</p>
            <p>Created by: {roomCreator}</p>
        </div>
        <div className="room-editor-body">
          <div className="task-editor flex flex-col gap-4">
        {roomTasks.map((task) => (
          <Task
            key={task.task_id}
            pointValue={task.pointValue}
            tags={task.tags}
          >
            {task.task_components.map((taskComponent) => (
              <TaskComponent
                key={taskComponent.task_component_id}
                componentType={taskComponent.type}
                taskComponentSpecificData={taskComponent.metadata}
                isEditing={true}
              />
            ))}
          </Task>
        ))}
        <button className="add-task flex items-center gap-2">
          <CirclePlus />
          Add Task
        </button>
      </div>
         </div>
         <div className="room_modification_info">
            <p>Created On {roomCreationDate}</p>
            <p>Last Modified On {roomLastEdited}</p>
         </div>
      </div>
    </>
  );
};

export default RoomEditor;
