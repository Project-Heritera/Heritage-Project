import PropTypes from "prop-types";
import { safeParse } from "zod";
import TextTaskComponent from "./TextComponent/TextTaskComponent";
import MCQTaskComponent from "./mcqTaskComponent";
import ImageTaskComponent from "./imageTaskComponent";
import {taskComponentTypes} from "../../utils/taskComponentTypes";
import { useEffect, useState } from "react";
import QuestionTaskComponent from "./QuestionTaskComponent";
TaskComponent.propTypes = {
  componentType: taskComponentTypes, 
  taskComponentSpecificData: PropTypes.string,
  isEditing: PropTypes.bool
};

function TaskComponent({ componentType, taskComponentSpecificData="", isEditing }) {
  const [jsonData, setJsondata] = useState(taskComponentSpecificData);
  useEffect(()=>{
     //if newly created, assign a default schema
    if (jsonData==""){
      setJsondata(JSON.stringify(componentType.defaultValue)); 
    }
  },[]);

  function serialize(componentTypeToSerialize, jsonToSerialize){
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
            <QuestionTaskComponent 
                
            />

          )
        }
        else{
          return (
           <Component
           serialize={serialize}
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
export default TaskComponent;