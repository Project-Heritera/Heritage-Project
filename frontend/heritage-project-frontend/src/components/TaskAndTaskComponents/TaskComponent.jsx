import PropTypes from "prop-types";
import { json, safeParse } from "zod";
import TextTaskComponent from "./TextComponent/TextTaskComponent";
import ImageTaskComponent from "./imageTaskComponent";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { useImperativeHandle, forwardRef, useEffect, useState, useRef } from "react";
import QuestionTaskComponentWrapper from "./QuestionTaskComponentWrapper";
import { Component } from "lucide-react";

const TaskComponent = forwardRef(function TaskComponent(
  {
    componentType,
    taskComponentSpecificData = "",
    isEditing,
    taskID,
    questionProgressData,
  },
  ref
) {
  const [jsonData, setJsondata] = useState(taskComponentSpecificData);
  const childRef = useRef(null);

  useEffect(() => {
    //if newly created, assign a default schema
    if (jsonData == "") {
      setJsondata(JSON.stringify(componentType.defaultValue));
    }
  }, []);
  }, []);

  function serializeInternal() {
    console.log("in serializeinternal in task component");
    if (!childRef.current?.serialize) {
      console.warn("Child component has no serialize method");
      return null;
    }

    // If the child is a QuestionWrapper, its serialize will handle passing json to TaskComponent's internal serialize
    return childRef.current.serialize();
  }

  useImperativeHandle(ref, () => ({
    serialize: serializeInternal,
  }));

  {
    const Component = taskComponentTypes[componentType].component;
    if (Component != null) {
      if (taskComponentTypes[componentType].category === "Question") {
        return (
          <QuestionTaskComponentWrapper
            QuestionTaskComponent={Component}
            isEditing={isEditing}
            jsonData={jsonData}
            taskID={taskID}
            questionProgressData={questionProgressData}
            ref={childRef}
          />
        );
      } else {
        return (
          <Component
            jsonData={taskComponentSpecificData}
            isEditing={isEditing}
            ref={childRef}
          />
        );
      }
    } else {
      return (
        <>
          <p>Error did not provide component type</p>;
        </>
      );
    }
  }
});
TaskComponent.propTypes = {
  componentType: taskComponentTypes,
  taskComponentSpecificData: PropTypes.string,
  isEditing: PropTypes.bool,
};
export default TaskComponent;

