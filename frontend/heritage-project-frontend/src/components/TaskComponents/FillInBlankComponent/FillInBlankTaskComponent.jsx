import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import statusTypes from "@/utils/statusTypes";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { SpecialCharToolbar } from "@/components/SpecialCharacterToolbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FillInBlankTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [text, setText] = useState(""); // Question text with ___ placeholder
  const [answer, setAnswer] = useState(""); // Correct answer
  const [userInput, setUserInput] = useState(""); // User input in display mode
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [activeInput, setActiveInput] = useState("text"); // 'text', 'answer', or 'userInput'

  // Load jsonData into state on mount
  useEffect(() => {
    if (!jsonData) return;
    setText(jsonData.text || "");
    setAnswer(jsonData.answer || "");
  }, [jsonData]);

  useImperativeHandle(ref, () => ({
    serialize: () => {
      return {
        type: "FILL",
        content: {
          text,
          answer,
        },
      };
    },
    checkIfCorrect: () => {
      if (userInput.trim() === "") return statusTypes.NOSTAR;
      if (userInput.trim().toLowerCase() === answer.trim().toLowerCase())
        return statusTypes.COMPLE;
      return statusTypes.INCOMP;
    },
  }));

  const onSpecialCharacterInsert = (character) => {
    if (activeInput === "text") {
      setText((prev) => prev + character);
    } else if (activeInput === "answer") {
      setAnswer((prev) => prev + character);
    } else if (activeInput === "userInput") {
      setUserInput((prev) => prev + character);
    }
  };

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
          onFocus={() => setActiveInput("userInput")}
          placeholder="Type your answer"
        />
        <span>{parts[1]}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Fill in the Blank</CardTitle>
          <Button
            variant={showSpecialChars ? "destructive" : "outline"}
            size="icon"
            onClick={() => setShowSpecialChars((prev) => !prev)}
          >
            <Languages size={18} className="lucide-icon text-gray-800" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSpecialChars && (
          <SpecialCharToolbar onInsert={onSpecialCharacterInsert} />
        )}

        {isEditing ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fill-text">Text</Label>
              <Input
                id="fill-text"
                className="bg-background"
                placeholder='Enter text with "___" as blank'
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setActiveInput("text")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fill-answer">Answer</Label>
              <Input
                id="fill-answer"
                className="bg-background"
                placeholder="Correct answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onFocus={() => setActiveInput("answer")}
              />
            </div>
          </div>
        ) : (
          renderDisplayText()
        )}
      </CardContent>
    </Card>
  );
});

export default FillInBlankTaskComponent;
