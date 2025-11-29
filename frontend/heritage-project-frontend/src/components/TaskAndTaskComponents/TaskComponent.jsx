import PropTypes from "prop-types";
import { json, safeParse } from "zod";
import TextTaskComponent from "./TextComponent/TextTaskComponent";
import ImageTaskComponent from "./imageTaskComponent";
import {taskComponentTypes} from "../../utils/taskComponentTypes";
import {useImperativeHandle, forwardRef, useEffect, useState } from "react";
import QuestionTaskComponentWrapper from "./QuestionTaskComponentWrapper";
import { Component } from "lucide-react";

const TaskComponent = forwardRef(function TaskComponent(
  { componentType, taskComponentSpecificData = "", isEditing, taskID, questionProgressData },
  ref
) {

  const [jsonData, setJsondata] = useState(taskComponentSpecificData);

  useEffect(()=>{
     //if newly created, assign a default schema
    if (jsonData==""){
      setJsondata(JSON.stringify(componentType.defaultValue)); 
    }
  },[]);

  useImperativeHandle(ref, () => ({
    serialize: serializeInternal,
  }));

  function serializeInternal(componentTypeToSerialize, jsonToSerialize){
    if (!Object.values(taskComponentTypes).includes(componentTypeToSerialize)){
      throw new TypeError("Invalid task component type passed");
    }
    try {
      jsonToSerialize = JSON.parse(jsonToSerialize);
    } catch (error) {
      throw new TypeError("Invalid JSON string")
    }
    const jsonSchema = componentTypeToSerialize.schema;
    const result = jsonSchema.safeParse(jsonToSerialize);
    if (!result.success){ throw new Error(result.error.issues);}
    else{ return true; }
  }

    {
       const Component = taskComponentTypes[componentType].component;
       if (Component != null){
        if (taskComponentTypes[componentType].category==="Question"){
          return (
            <QuestionTaskComponentWrapper 
            serialize={serializeInternal}
            QuestionTaskComponent={Component}
            isEditing={isEditing}
            jsonData={jsonData}
            taskID={taskID}
questionProgressData={questionProgressData}
            />
          )
        }
        else{
          return (
           <Component
           serialize={serializeInternal}
           jsonData={taskComponentSpecificData}
           isEditing={isEditing}
            />
          )
        }
        }
        else{
          return(
          <>
          <p>Error did not provide component type</p>;
          </>
 )}
      
    }
  }
);
TaskComponent.propTypes = {
  componentType: taskComponentTypes, 
  taskComponentSpecificData: PropTypes.string,
  isEditing: PropTypes.bool
};
export default TaskComponent;