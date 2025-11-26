import React from "react";
import { Button } from "@/components/ui/button";

//Component used to render the choice button for the reading side of the component
const ChoiceButton = ({ choiceId, text, isCorrect, selected, onClick }) => {
  return (
    <Button
     onClick={onClick}
      className={`choice-button ${selected ? "selected" : ""}`}
      style={{
        backgroundColor: selected ? "" : "#f3f4f6",
        color: selected ? "white" : "black",
        border: selected ? "2px solid #2563eb" : "2px solid transparent",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        cursor: "pointer",
        margin: "0.25rem 0",
      }}
    >
      {choiceId}: {text}
    </Button>
  );
};

export default ChoiceButton;
