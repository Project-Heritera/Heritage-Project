import React from "react";
import { Button } from "@/components/ui/button";

//Component used to render the choice button for the reading side of the component
const ChoiceButton = ({ choiceId, text, selected, onClick, revealedCorrect, revealedIncorrect }) => {
  // revealedCorrect / revealedIncorrect expected as Sets containing numeric ids
  const idStr = String(choiceId);
  const isRevealedCorrect = revealedCorrect && revealedCorrect.has && revealedCorrect.has(idStr);
  const isRevealedIncorrect = revealedIncorrect && revealedIncorrect.has && revealedIncorrect.has(idStr);

  let borderColor = "transparent";
  if (isRevealedCorrect) borderColor = "#16a34a"; // green
  else if (isRevealedIncorrect) borderColor = "#dc2626"; // red
  else if (selected) borderColor = "#2563eb"; // blue for current selection

  return (
  <Button
  onClick={onClick}
  className={`choice-button ${selected ? "selected" : ""}`}
  style={{
    backgroundColor: selected ? "" : "#f3f4f6",
    color: selected ? "white" : "black",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    margin: "0.25rem 0",
    minWidth: "40%"
  }}
>
  <div
    style={{
      textAlign: "left",
      whiteSpace: "pre-wrap",   // <-- makes spaces show
      width: "100%"
    }}
  >
    {`${choiceId}:     ${text}`}
  </div>
</Button>
  );
};

export default ChoiceButton;
