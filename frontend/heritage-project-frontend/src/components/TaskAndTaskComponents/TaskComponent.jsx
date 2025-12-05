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
