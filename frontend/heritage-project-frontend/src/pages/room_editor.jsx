import { useEffect, useState, useRef } from "react";
import ReactSelectionPopup from "react-selection-popup";
import {
  CirclePlus,
  List,
  Save,
  ChevronUp,
  ChevronDown,
  Trash2,
  Info,
  BookA,
} from "lucide-react";
import "../styles/pages/room_editor.css";
import TaskEditor from "../components/TaskAndTaskComponents/TaskEditor";
import { Debug } from "@/utils/debugLog";
import { useErrorStore } from "../stores/ErrorStore";
import { useParams, useNavigate } from "react-router-dom";
import { get_room_data, get_test_room, save_room } from "../services/room";
import { objectToFormData } from "../utils/objectToFormData";
import PublishRoomForm from "@/components/RoomsPage/PublishRoomForm";
import Modal from "@/components/Modal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { get_random_image_from_list } from "@/utils/default_images";

const RoomEditor = () => {
  const { course_id, section_id, room_id } = useParams(); //get ids from url
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(
    get_random_image_from_list()
  );
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [roomData, setRoomData] = useState({});
  const [roomTitle, setRoomTitle] = useState("Untitled Room");
  const [roomDesc, setRoomDesc] = useState("No Description");
  const [roomCreator, setRoomCreator] = useState("No Creator");
  const [roomTasks, setRoomTasks] = useState([]);
  const [roomCreationDate, setRoomCreationDate] = useState("Unavailable");
  const [roomLastEdited, setRoomLastEdited] = useState("Unavailable");
  const [roomVisibility, setRoomVisibility] = useState("PRI");
  //for displaying status like error popup
  const showError = useErrorStore((state) => state.showError);
  // Store refs for all task components
  const taskRefs = useRef({});
  //for popup that triggers open in dictionary
  const popupRef = useRef(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        //const room_data = await get_test_room();
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
        if (room_data["can_edit"] !== true) {
          showError(
            "Room has already been posted and cannot be modified anymore",
            "error"
          );
          Debug.error(
            "Editing page reached and room data doesn't have editing_mode set to true"
          );
          navigate(-1)
        }
        if (room_data.title) {
          setRoomTitle(room_data.title);
        }
        if (room_data.image) {
          setBackgroundImage(room_data.image);
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

        //load username from creator field and set room creater state
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


  const addNewTask = () => {
    const newTask = {
      // Generate a unique temporary ID for the new task
      task_id: `temp_${crypto.randomUUID()}`,
      tags: ["Easy"],
      task_components: [],
    };
    setRoomTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (taskId) => {
    setRoomTasks((prev) => prev.filter((task) => task.task_id !== taskId));
  };

  const moveTaskUp = (taskId) => {
    setRoomTasks((prev) => {
      const index = prev.findIndex((task) => task.task_id === taskId);
      if (index <= 0) return prev; // Already at top
      const newTasks = [...prev];
      [newTasks[index], newTasks[index - 1]] = [
        newTasks[index - 1],
        newTasks[index],
      ];
      return newTasks;
    });
  };

  const moveTaskDown = (taskId) => {
    setRoomTasks((prev) => {
      const index = prev.findIndex((task) => task.task_id === taskId);
      if (index >= prev.length - 1) return prev; // Already at bottom
      const newTasks = [...prev];
      [newTasks[index], newTasks[index + 1]] = [
        newTasks[index + 1],
        newTasks[index],
      ];
      return newTasks;
    });
  };

  // Function to serialize everything to ever exist
  const serializeAllTasks = async () => {
    try {
    const updatedRoomData = {
      title: roomTitle,
      can_edit: true,       
      description: roomDesc,
      metadata: {},          
      visibility: roomVisibility,
      tasks: [],             
    };

      // Serialize tasks and components
      for (const taskId in taskRefs.current) {
        const taskRef = taskRefs.current[taskId];
        if (taskRef?.serialize) {
          const serializedTask = taskRef.serialize();
          // If the task has a temporary ID (i.e., it's a new task),
          // remove the task_id field before saving. The backend will assign a new one.
          if (String(serializedTask.task_id).startsWith("temp_")) {
            delete serializedTask.task_id;
          }
          updatedRoomData.tasks.push(serializedTask);
        }
      }
    }

    console.log("updated room", updatedRoomData);

    // Make request to overwrite room
    const room_status = await save_room(
      course_id,
      section_id,
      room_id,
      updatedRoomData
    );
      return room_status;
    } catch (err) {
      showError(
        "Unable to save room. Please report this issue to ffronchetti@lsu.edu",
        "error"
      );
      Debug.error("Error at room.js or publish room api at backend:", err);
      return null;
    }
  };
  const handleSelect = (text, meta) => {
    console.log("Selected text:", text);
  };

  return (
    <div className="relative w-screen min-h-screen">
      <ReactSelectionPopup
        ref={popupRef}
        onSelect={handleSelect}
        selectionClassName="roomEditorBody"
      >
        <div>
          <p>Popup Content</p>
          <button
            onClick={() => {
              ref.current?.close();
            }}
          >
            Close
          </button>
        </div>
      </ReactSelectionPopup>
      {/* Background layer: repeats infinitely */}
      <div
        className="roomEditorBody fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: "repeat", // repeats in both directions
          backgroundPosition: "top left",
          backgroundSize: "auto", // keep natural size
        }}
      />

      {/* Foreground content */}
      <div className="room-editor min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                {/* Left content */}
                <div className="flex-1 flex flex-col gap-2">
                  <CardTitle className="text-3xl sm:text-4xl mb-2">
                    {roomTitle}
                  </CardTitle>
                  <CardDescription className="text-base mb-1">
                    {roomDesc}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    Created By: {roomCreator}
                  </p>

                  {/* Links */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2">
                    <Button
                      asChild
                      variant="outline"
                      className="mb-2 sm:mb-0 gap-2"
                    >
                      <a
                        href="/tutorials/making_content/creating_tasks"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        How to Make a Room
                        <Info className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button asChild variant="outline" className="gap-2">
                      <a
                        href="/dictionary/Creole"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Dictionary
                        <BookA />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={serializeAllTasks}
                    size="lg"
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Room
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setPublishModalOpen(true)}
                  >
                    Publish Room
                  </Button>
                </div>
              </div>
            </CardHeader>
          
            <Separator />
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Badge variant="outline" className="w-fit">
                  Visibility: {roomVisibility}
                </Badge>
                <Badge variant="outline" className="w-fit">
                  Created: {roomCreationDate}
                </Badge>
                <Badge variant="outline" className="w-fit">
                  Last Edited: {roomLastEdited}
                </Badge>
              </div>
            </CardContent>
          </Card>

   <Modal
          isOpen={publishModalOpen}
          onClose={() => {navigate(-1)}}
        >
          <PublishRoomForm
            room_id={room_id}
            onClose={() => {navigate(-1)}}
            />
        </Modal>
          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
              <Badge variant="secondary">{roomTasks.length} tasks</Badge>
            </div>

            <div className="space-y-4">
              {roomTasks.map((task, index) => (
                <Card
                  key={task.task_id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Task ID: {String(task.task_id).slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveTaskUp(task.task_id)}
                          disabled={index === 0}
                          title="Move task up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveTaskDown(task.task_id)}
                          disabled={index === roomTasks.length - 1}
                          title="Move task down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTask(task.task_id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <TaskEditor
                      key={task.task_id}
                      ref={(el) => (taskRefs.current[task.task_id] = el)}
                      initialTags={task.tags}
                      initialComponents={task.components}
                      taskID={task.task_id}
                    />
                  </CardContent>
                </Card>
              ))}
              <Button
                onClick={addNewTask}
                className="w-full h-12 gap-2 border-dashed"
              >
                <CirclePlus className="w-5 h-5" />
                Add New Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomEditor;
