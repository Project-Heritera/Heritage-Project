import PropTypes from "prop-types";
import { update_task_progress } from "@/services/room";
import { TaskGlobalContext } from "./TaskBase";
import {
  useImperativeHandle,
  useContext,
  forwardRef,
  useEffect,
  useState,
  useRef,
} from "react";
import TextTaskComponent from "./TextComponent/TextTaskComponent";
import { useNavigate } from "react-router-dom";
import BadgeAward from "../RoomsPage/BadgeAward";
import ImageTaskComponent from "../TaskComponents/ImageComponent/ImageTaskComponent";
import QuestionTaskComponentWrapper from "./QuestionTaskComponentWrapper";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { CardContent } from "../ui/card";
import { Checkbox } from "@radix-ui/react-checkbox";
import Modal from "../Modal";
import { Nav } from "react-day-picker";

const TaskComponent = forwardRef(function TaskComponent(
  {
    componentType,
    taskComponentSpecificData = "",
    isEditing,
    taskID,
    questionProgressData,
    task_component_id,
  },
  ref
) {
  const [jsonData, setJsonData] = useState(taskComponentSpecificData);
  const childRef = useRef(null);
  //for static task component checkbox
  const [isComplete, setIsComplete] = useState(
    questionProgressData.status == "COMPLE"
  ); 
  //for badge award
  const [badgeAwardOpen, setBadgeAwardOpen]= useState(false);
  const Navigate = useNavigate();
  const { taskStatus, setTaskStatus, badge_title, badge_image_url } =
      useContext(TaskGlobalContext); // states from task

  // Assign default value if newly created
  useEffect(() => {
    if (jsonData === "") {
      setJsonData(JSON.stringify(componentType.defaultValue));
    }
  }, [componentType, jsonData]);

  // Serialization function exposed to parent
  function serializeInternal() {
    console.log("inside of task component serialize");
    if (!childRef.current?.serialize) {
      console.warn("Child component has no serialize method");
      return null;
    }
    const childData = childRef.current.serialize();
    console.log("serialize in task component", {
      ...childData,
      task_component_id,
    });
    return {
      ...childData,
      task_component_id,
    };
  }

  useImperativeHandle(ref, () => ({
    serialize: serializeInternal,
  }));

  const onStaticTaskComponentComplete = async () => {
    try {
      //update task progress
      const update_task_progress_payload = {
        status: "COMPLE",
      };
      // call the backend and wait for the response
      const room_completed = await update_task_progress(
        taskID,
        update_task_progress_payload
      );
      if (room_completed == true) {
        // display award badge modal
        setBadgeAwardOpen(true)
      } else if (room_completed == false) {
        return;
      } else {
        Debug.error("Failed to update task progress", error);
      }
    } catch {
      Debug.log("Failed to update task progress");
    }
  };

  // Render the correct component based on type
  const Component = taskComponentTypes[componentType]?.component;

  if (!Component) {
    return (
      <>
        <p>Error: invalid or missing component type</p>
      </>
    );
  }

  if (taskComponentTypes[componentType].category === "Question") {
    return (
      <QuestionTaskComponentWrapper
        ref={childRef}
        QuestionTaskComponent={Component}
        isEditing={isEditing}
        jsonData={jsonData}
        taskID={taskID}
      />
    );
  } else {
    return (
      <>
        <Component ref={childRef} isEditing={isEditing} jsonData={jsonData} />
        <CardContent className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id={`complete-${taskID}`}
            checked={isComplete}
            onChange={async (e) => {
              setIsComplete(e.target.checked);
              if (e.target.checked) {
                await onStaticTaskComponentComplete();
              }
            }}
          />
          <label htmlFor={`complete-${taskID}`}>Mark as Complete</label>
        </CardContent>
        <Modal
          isOpen={badgeAwardOpen}
          onClose={() => {
            Navigate(-1)
          }}
        >
          <BadgeAward
            badge_title={badge_title}
            onClose={() => {
              Navigate(-1)
            }}
            badge_image_url={
              badge_image_url
            }
          />
        </Modal>
      </>
    );
  }
});

TaskComponent.propTypes = {
  componentType: PropTypes.string.isRequired,
  taskComponentSpecificData: PropTypes.string,
  isEditing: PropTypes.bool,
  taskID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  questionProgressData: PropTypes.object,
};

export default TaskComponent;
