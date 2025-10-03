import PropTypes from "prop-types";
import { safeParse } from "zod";
import TextEditor from "./TextEditor";
import {taskComponentTypes, getComponentTypeSchema, getDefaultComponentJson} from "../../utils/taskComponentTypes";
BaseTaskComponentEditor.propTypes = {
  componentType: taskComponentTypes
};

function BaseTaskComponentEditor(props) {
  function serialize(componentTypeToSerialize, jsonToSerialize){
    if (!(Object.values(componentType).includes(componentTypeToSerialize)&& Object.values(JSON).includes(jsonToSerialize))){
      throw new TypeError("Invalid datatype");
    }
    const jsonSchema = getComponentTypeSchema(componentTypeToSerialize);
    const result = jsonSchema.safeParse(jsonToSerialize)
    if (!result.success){ throw new Error(result.error.issues);}
    else{ return true; }
  }
  function unserialize(componentTypeToSerialize, jsonStringToUnserialize=""){
    if (!(Object.values(componentType).includes(componentTypeToSerialize)&& typeof jsonStringToUnserialize === "string")){
      throw new TypeError("Invalid datatype");
    }
    //if newly created, assign a default schema
    if (jsonStringToUnserialize==""){
      jsonStringToUnserialize = JSON.stringify(getDefaultComponentJson(componentTypeToSerialize)) 
    }
    const jsonSchema = getComponentTypeSchema(componentTypeToSerialize);
    const result = jsonSchema.safeParse(jsonToSerialize)
    if (!result.success){ throw new Error(result.error.issues);}
    else{ return true; }
  }
  return (
    <div>
      <div>
      <h1>This is a task component editor!</h1>
      </div>
    {(() => {
      switch (props.componentType) {
        case "MCQ":
          return <StepOne />;
        case "TEXT":
          return <TextEditor serialize={serialize} unserializedData  />;
        case "IMAGE":
          return <StepThree />;
        default:
          return (<p>Error did not provide component type</p>);
      }
    })()}
    </div>
  );
}