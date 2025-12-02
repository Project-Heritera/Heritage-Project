import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import statusTypes from "@/utils/statusTypes";
import { taskComponentTypes } from "@/utils/taskComponentTypes";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FillInBlankTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [text, setText] = useState("");          // Question text with ___ placeholder
  const [answer, setAnswer] = useState("");      // Correct answer
  const [userInput, setUserInput] = useState(""); // User input in display mode

  // Load jsonData into state on mount
  useEffect(() => {
    if (!jsonData) return;
    setText(jsonData.text || "");
    setAnswer(jsonData.answer || "");
  }, [jsonData]);

  useImperativeHandle(ref, () => ({
    serialize: () => {
      return {
        type: taskComponentTypes.INPUT,
        text,
        answer,
      };
    },

    checkIfCorrect: () => {
      if (userInput.trim() === "") return statusTypes.INCOMP;
      if (userInput.trim().toLowerCase() === answer.trim().toLowerCase()) return statusTypes.COMPLE;
      return statusTypes.INCORR;
    },
  }));

  // Render display mode with input using ShadCN Input
  const renderDisplayText = () => {
    const parts = text.split("___");
    if (parts.length === 1) return <p>{text}</p>;

    return (
      <div className="flex flex-wrap gap-2 items-center">
        <span>{parts[0]}</span>
        <Input
          className="w-32 inline-block"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your answer"
        />
        <span>{parts[1]}</span>
      </div>
    );
  };


 return (
    <Card className="p-4 space-y-4">
      {isEditing ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Text</label>
            <Input
              placeholder='Enter text with "___" as blank'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Answer</label>
            <Input
              placeholder="Correct answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        </div>
      ) : (
        renderDisplayText()
      )}
    </Card>
  );
});

export default FillInBlankTaskComponent;
