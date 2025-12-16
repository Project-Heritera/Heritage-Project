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
import TextTaskComponentInstructions from "./TextTaskComponentInstructions";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
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
  const [instructionsOpen, setInstructionsOpen] = useState(false);

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
        <>
          <Button
            variant="outline"
            className="mb-3"
            onClick={() => setInstructionsOpen(true)}
          >
            <Info className="h-4 w-4" />
          </Button>

          {/* Instructions Modal */}
          <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <DialogPortal>
              <DialogOverlay className="fixed inset-0 bg-black/50 z-[1000]" />

              <DialogContent className="fixed top-1/2 left-1/2 z-[1001] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800 p-6 flex flex-col gap-6">
                <DialogTitle className="text-lg font-semibold">
                  Text Component Instructions
                </DialogTitle>

                <TextTaskComponentInstructions />

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setInstructionsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </DialogPortal>
          </Dialog>

          <Edit
            text={text}
            setText={setText}
            areaApi={areaApi}
            setAreaApi={setAreaApi}
          />
        </>
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
