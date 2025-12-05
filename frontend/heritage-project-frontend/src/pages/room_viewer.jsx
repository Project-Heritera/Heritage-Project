import { useEffect, backgroundImage, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  get_room_data,
  get_test_room_for_viewer,
  get_task_progress_for_room,
} from "../services/room";
import { useErrorStore } from "../stores/ErrorStore";
import { Debug } from "../utils/debugLog";
import "../styles/pages/room_editor.css";
import TaskViewer from "../components/TaskAndTaskComponents/TaskViewer";
import statusTypes from "../utils/statusTypes";
import { get_random_image_from_list } from "@/utils/default_images";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RoomViewer = () => {
  const { course_id, section_id, room_id } = useParams();
  const navigate = useNavigate();
  const showError = useErrorStore((state) => state.showError);
  const [backgroundImage, setBackgroundImage] = useState(
    get_random_image_from_list()
  );
  const [badge_title, set_badge_title] = useState("");
  const [badge_image_url, set_badge_image_url] = useState("");

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
        //const room_data = await get_test_room_for_viewer();
        const room_data = await get_room_data(room_id);
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
        if (room_data.image) {
          setBackgroundImage(room_data.image);
        }
        if (room_data.badge.image) {
          set_badge_image_url(room_data.badge.image);
        }
        if (room_data.badge.title) {
          set_badge_title(room_data.badge.title);
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

        // Load task progress data
        let taskProgressData = [];
        try {
          taskProgressData = await get_task_progress_for_room(
            course_id,
            section_id,
            room_id
          );
          Debug.log("Task progress data loaded:", taskProgressData);
        } catch (progressErr) {
          Debug.error("Failed to load task progress data:", progressErr);
          // Continue without progress data if it fails
        }

        // Create a map of task_id to progress data for easy lookup
        const progressMap = {};
        if (Array.isArray(taskProgressData)) {
          taskProgressData.forEach((progress) => {
            progressMap[progress.task_id] = progress;
          });
        }

        //else set state to user_unavailable
        const tasks = Array.isArray(room_data.tasks) ? room_data.tasks : [];
        const normalizedTasks = tasks.map((task) => {
          const progress = progressMap[task.task_id] || null;
          return {
            ...task,
            task_components: Array.isArray(task.components)
              ? task.components
              : [],
            // Add progress data to each task
            progress: progress
              ? {
                  status: progress.status,
                  attempts: progress.attempts,
                  metadata: progress.metadata,
                }
              : null,
          };
        });
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
  }, [course_id, section_id, room_id]);
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
    <div className="relative min-h-screen w-full">
      {/* Background layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: "repeat", // repeat infinitely
          backgroundPosition: "top left",
          backgroundSize: "auto", // keeps original size
        }}
      />

      {/* Foreground content */}
      <div className="room-editor flex flex-col px-8 py-6 relative z-10">
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← RETURN
              </Button>
            </div>
            <div className="mt-2 space-y-3">
              <CardTitle className="text-3xl font-bold">
                Viewer for Room: {roomTitle}
              </CardTitle>
              <CardDescription className="text-base">
                {roomDesc}
              </CardDescription>
              <p className="text-sm italic text-muted-foreground">
                Created by: {roomCreator}
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="room-editor-body">
          <div className="task-editor flex flex-col gap-6 items-center">
            {roomTasks.map((task, index) => (
              <Card
                key={task.task_id}
                className="w-full max-w-6xl shadow-lg border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle>Task #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskViewer
                    ref={(el) => (taskRefs.current[task.task_id] = el)}
                    initialComponents={
                      task.task_components || task.components || []
                    }
                    initialStatus={task.progress?.status || null}
                    initialAttempts={task.progress?.attempts ?? 0}
                    initialMetadata={task.progress?.metadata || {}}
                    taskID={task.task_id}
                    badge_title={badge_title}
                    badge_image_url={badge_image_url}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-6 bg-white/5 backdrop-blur-lg border border-white/15 rounded-xl shadow-sm p-4">
          <CardContent className="flex flex-col gap-2">
            <p>Created On: {roomCreationDate}</p>
            <p>Last Modified On: {roomLastEdited}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoomViewer;
