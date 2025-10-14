import PropTypes from "prop-types";
import { safeParse } from "zod";
import TextTaskComponent from "./textTaskComponent";
import MCQTaskComponent from "./mcqTaskComponent";
import ImageTaskComponent from "./imageTaskComponent";
import {
  taskComponentTypes,
  getComponentTypeSchema,
  getDefaultComponentJson,
} from "../../utils/taskComponentTypes";
import { forwardRef, useEffect, useState, useImperativeHandle } from "react";
import { GripVertical, Trash } from "lucide-react";

//Added Forward Ref in order to atttach the Ref from parent properly
const TaskComponent = forwardRef(
  (
    {
      index,
      onDragStart,
      onDragOver,
      onDrop,
      isDragging,
      componentType,
      taskComponentSpecificData = "",
      isEditing,
    },
    ref
  ) => {
    const [jsonData, setJsondata] = useState(taskComponentSpecificData);

    useEffect(() => {
      //if newly created, assign a default schema
      if (jsonData == "") {
        setJsondata(JSON.stringify(getDefaultComponentJson(componentType)));
      }
    }, []);

    function serialize(componentTypeToSerialize, jsonToSerialize) {
      if (
        !Object.values(taskComponentTypes).includes(componentTypeToSerialize)
      ) {
        throw new TypeError("Invalid task component type passed");
      }

      // Handle both object and string inputs
      let dataToValidate = jsonToSerialize;
      console.log(dataToValidate);
      if (typeof jsonToSerialize === "string") {
        try {
          dataToValidate = JSON.parse(jsonToSerialize);
        } catch (error) {
          throw new TypeError("Invalid JSON string");
        }
      }

      const jsonSchema = getComponentTypeSchema(componentTypeToSerialize);
      const result = jsonSchema.safeParse(dataToValidate);
      console.log("RESULT", result);

      if (!result.success) {
        throw new Error(result.error.issues);
      } else {
        return true;
      }
    }
    //basically exposes the seralize function to the parent
    useImperativeHandle(ref, () => ({
      serialize: () => {
        // Call serialize with current component state
        const isValid = serialize(componentType, jsonData);
        if (isValid) {
          return {
            componentType,
            data: JSON.parse(jsonData),
          };
        }
      },
    }));

    return (
      //Dragging Handler

      <div>
        {(() => {
          switch (componentType) {
            case "MCQ":
              return (
                <MCQTaskComponent
                  serialize={serialize}
                  jsonData={jsonData}
                  isEditing={isEditing}
                />
              );
            case "TEXT":
              return (
                <TextTaskComponent
                  serialize={serialize}
                  jsonData={jsonData}
                  isEditing={isEditing}
                />
              );
            case "IMAGE":
              return (
                <ImageTaskComponent
                  serialize={serialize}
                  jsonData={jsonData}
                  isEditing={isEditing}
                />
              );
            default:
              return <p>Error did not provide component type</p>;
          }
        })()}
      </div>
    );
  }
);
TaskComponent.propTypes = {
  componentType: taskComponentTypes,
  taskComponentSpecificData: PropTypes.string,
  isEditing: PropTypes.bool,
};
export default TaskComponent;
