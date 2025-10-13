import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { taskComponentTypes, getComponentTypeSchema } from "../../utils/taskComponentTypes";

TextTaskComponent.propTypes = {
  serialize: PropTypes.func.isRequired,
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};

function TextTaskComponent({ serialize, jsonData, isEditing}) {
  const [localText, setLocaltext] = useState("");

  // Load jsonData into local state on component creation
  useEffect(() => {
    if (jsonData) {
      try {
        const schema = getComponentTypeSchema(taskComponentTypes.TEXT);
        const parsed = schema.parse(jsonData);
        if (!("text" in parsed)) {
        Debug.log("1")
          throw new Error("Text field missing in unserialized data.");
        }
        setLocaltext(parsed.text);
      } catch (err) {
        console.error("Failed to load TextEditor:", err);
        // Kill component
        setLocaltext("");
      }
    }
  }, []);
  //create json from localText state and pass to serialize in parent
  function handleSerialize() {
    const jsonToSerialize = JSON.stringify({
      text: localText
    });
     serialize(taskComponentTypes.TEXT,jsonToSerialize);
  }
  //contain an input box if edit mode is active, show text if in viewing mode
  return (
    <div>
      {isEditing ? (
        <div>
        <input
        value={localText}  
        onChange={(e) => setLocaltext(e.target.value)}
        />
        </div>
      ) : (
        <p>{localText}</p>
      )}
    </div>
  );
}
export default TextTaskComponent;
