import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get_room_data, get_test_room_for_viewer } from "../services/room";
import { useErrorStore } from "../stores/ErrorStore";
import { Debug } from "../utils/debugLog";
import "../styles/pages/room_editor.css";
import TaskViewer from "../components/TaskAndTaskComponents/TaskViewer";

const RoomViewer = () => {
  const { course_id, section_id, room_id } = useParams();
  const navigate = useNavigate();
  const showError = useErrorStore((state) => state.showError);

  const [roomData, setRoomData] = useState({});
  const [roomTitle, setRoomTitle] = useState("Question Bank");
  const [roomDesc, setRoomDesc] = useState("Question Bank");
  const [roomCreator, setRoomCreator] = useState("No Creator");
  const [roomCreationDate, setRoomCreationDate] = useState("Unavailable");
  const [roomLastEdited, setRoomLastEdited] = useState("Unavailable");
  const [roomVisibility, setRoomVisibility] = useState("PUB");
  const [roomTasks, setRoomTasks] = useState([]); // Store answers by question index
  //store refs for all task components
  const taskRefs = useRef({});
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const room_data = await get_test_room_for_viewer();
        //const room_data = await get_room_data(course_id, section_id, room_id);
        if (!room_data) {
          showError(
            "Unable to load data for room. You may not have permission to edit the room, the room may have already been created, or the room id may not exist",
            "error"
          );
          Debug.error(
            "Room editing page entered but room id has no is editing field"
          );
          return;
        }
        Debug.log("room data: ", room_data);
        //dont load page if room dosent have can edit set to true
        if (room_data["can_edit"] == true) {
          showError("Room has not been released yet", "error");
          Debug.error(
            "Viewing page reached and room data has editing_mode set to true"
          );
        }
        if (room_data.title) {
          setRoomTitle(room_data.title);
        }
        if (room_data.description) {
          setRoomDesc(room_data.description);
        }
        if (room_data.last_updated) {
          setRoomLastEdited(room_data.last_updated);
        }
        if (room_data.created_on) {
          setRoomCreationDate(room_data.created_on);
        }
        if (room_data.creator) {
          setRoomCreator(room_data.creator);
        }
        if (room_data.visibility) {
          setRoomVisibility(room_data.visibility);
        }

        //else set state to user_unavailable
        const tasks = Array.isArray(room_data.tasks) ? room_data.tasks : [];
        const normalizedTasks = tasks.map((task) => ({
          ...task,
          task_components: Array.isArray(task.components)
            ? task.components
            : [],
        }));
        setRoomTasks(normalizedTasks);
        setRoomData(room_data);
      } catch (err) {
        showError(
          "Error loading room contents into page. Please contact developer with any complaints to ffronchetti@lsu.edu",
          "error"
        );
        Debug.error("Room exists, but Failed to load room data to page", err);
      }
    };
    loadRoom();
  }, []);
  const serializeAllTasks = async () => {
    try {
      let taskProgressData = [];

      // Serialize all tasks
      for (const taskId in taskRefs.current) {
        const taskRef = taskRefs.current[taskId];
        if (taskRef?.serialize) {
          const serializedTask = taskRef.serialize();
          taskProgressData.push(serializedTask);
        }
      }

      Debug.log("Serialized Task Progress Data:", taskProgressData);

      // TODO: Implement API call to save task progress
      // Example: await save_task_progress(course_id, section_id, room_id, taskProgressData);

      return taskProgressData;
    } catch (err) {
      showError(
        "Unable to save task progress. Please report this issue to ffronchetti@lsu.edu",
        "error"
      );
      Debug.error("Error saving task progress:", err);
      return null;
    }
  };

  const onTaskSubmit = async () => {
    console.log("On submit hit");
    const result = await serializeAllTasks();
    Debug.log("Task submission result:", result);
    // TODO: Show success message or navigate
  };
  return (
    <div className="room-editor flex flex-col px-8 py-6 gap-6">
      <div className="room-editor-header space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Viewer for Room: {roomTitle}</h1>
            <p className="text-base">{roomDesc}</p>
            <p className="text-sm italic">{roomCreator}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← RETURN
          </button>
        </div>
      </div>

      <div className="room-editor-body">
        <div className="task-editor flex flex-col gap-6">
          {roomTasks.map((task) => (
            <div
              key={task.task_id}
              className="rounded-lg border border-gray-300 p-4 shadow-sm space-y-4"
            >
              <TaskViewer
                key={task.task_id}
                ref={(el) => (taskRefs.current[task.task_id] = el)}
                initialComponents={
                  task.task_components || task.components || []
                }
                intialStatus={null}
                initialAttempts={null}
                initialMetadata={null}
                taskId={task.task_id}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="room_modification_info text-sm text-gray-500 mt-6">
        <p>Created On {roomCreationDate}</p>
        <p>Last Modified On {roomLastEdited}</p>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onTaskSubmit}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Submit All Answers
        </button>
      </div>
    </div>
  );
};

export default RoomViewer;
