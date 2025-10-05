import PropTypes from "prop-types";
import { safeParse } from "zod";
import TextTaskComponent from "./textTaskComponent";
import {taskComponentTypes, getComponentTypeSchema, getDefaultComponentJson} from "../../utils/taskComponentTypes";
import { useEffect, useState } from "react";
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
      setJsondata(JSON.stringify(getDefaultComponentJson(componentType))); 
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
    const jsonSchema = getComponentTypeSchema(componentTypeToSerialize);
    const result = jsonSchema.safeParse(jsonToSerialize);
    if (!result.success){ throw new Error(result.error.issues);}
    else{ return true; }
  }

 return (
    <div>
    {(() => {
      switch (componentType) {
        case "MCQ":
          return <StepOne />;
        case "TEXT":
          return <TextTaskComponent serialize={serialize} jsonData={jsonData} isEditing={isEditing}/>;
        case "IMAGE":
          return <StepThree />;
        default:
          return (<p>Error did not provide component type</p>);
      }
    })()}
    </div>
  );
}

export default TaskComponent;