import React from "react";

//Component used to render the choice button for the reading side of the component
const ChoiceButton = ({ choiceId, text, isCorrect, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`choice-button ${selected ? "selected" : ""}`}
      style={{
        backgroundColor: selected ? "#3b82f6" : "#f3f4f6",
        color: selected ? "white" : "black",
        border: selected ? "2px solid #2563eb" : "2px solid transparent",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        cursor: "pointer",
        margin: "0.25rem 0",
      }}
    >
      {choiceId}: {text}
    </button>
  );
};

export default ChoiceButton;
