import React, {
  useState,
  useEffect,
  ref,
  forwardRef,
  useImperativeHandle,
} from "react";
import Edit from "./EditTextComponet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Read from "./ReadTextComponent";
import "../../../styles/Components/TaskComponents/TextComponent.css";
import PropTypes from "prop-types";
import { taskComponentTypes } from "../../../utils/taskComponentTypes";
import { Info } from "lucide-react";

//This is the overall text componet for text.
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
const TextTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  useImperativeHandle(ref, () => ({
    serialize: () => {
      return { type: "TEXT", content: { text: text } };
    },
  }));
  const [areaApi, setAreaApi] = useState(null); //Used to provide fucntions to parent of MarkdownArea
  const [text, setText] = useState("");

  // Load jsonData into local state on component creation
  useEffect(() => {
    if (jsonData) {
      try {
        const schema = taskComponentTypes.TEXT.schema;
        const parsed = schema.parse(jsonData);
        if (!("text" in parsed)) {
          throw new Error("Text field missing in unserialized data.");
        }
        setText(jsonData.text);
      } catch (err) {
        console.error("Failed to load TextEditor:", err);
        // Kill component
        //maybe add text = ""
      }
    }
  }, []);

  return (
    <CardContent className="text-component">
      {isEditing ? (
        <Edit
          text={text}
          setText={setText}
          areaApi={areaApi}
          setAreaApi={setAreaApi}
        />
      ) : (
        <Read text={text} />
      )}
    </CardContent>
  );
});
TextTaskComponent.propTypes = {
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};
export default TextTaskComponent;
