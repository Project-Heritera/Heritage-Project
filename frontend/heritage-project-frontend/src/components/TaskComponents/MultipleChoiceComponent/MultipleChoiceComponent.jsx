import React, { useState, forwardRef, useImperativeHandle } from "react";
import statusTypes from "../../../utils/statusTypes";
import Edit from "./EditMultipleChoice";
import Use from "./UseMultipleChoice";
import { taskComponentTypes } from "../../../utils/taskComponentTypes";

const MultipleChoiceComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [choiceApi, setChoiceApi] = useState(null); //Used to provide functions to parent of MarkdownArea
  const [selectedAnswerChoice, setSelectedAnswerChoice] = useState([]); //set to id of selected button for viewer
  
function handleSelectAnswerChoice(selectedID) {
  const correctAnswerChoices = choiceArray.filter(c => c.correct).map(c => c.id);

  // If only one correct answer, enforce single selection
  if (correctAnswerChoices.length === 1) {
    setSelectedAnswerChoice([selectedID]);
  } else {
    // Multiple correct answers allowed
    if (selectedAnswerChoice.includes(selectedID)) {
      setSelectedAnswerChoice(prev => prev.filter(item => item !== selectedID));
    } else {
      setSelectedAnswerChoice([...selectedAnswerChoice, selectedID]);
    }
  }
}
  
  function checkIfCorrect() {
    if (selectedAnswerChoice === []) return statusTypes.INCOMP;

    let correctAnswerChoices = [];
    for (const choice of choiceArray) {
      if (choice.correct === true) {
        correctAnswerChoices.push(choice.id);
      }
    }
    const allCorrect = selectedAnswerChoice.every(id =>
    correctAnswerChoices.includes(id)
  );

  return allCorrect ? statusTypes.COMPLE : statusTypes.INCOMP;
 }


useImperativeHandle(ref, () => ({
  serialize: () => {
    console.log("in serialize in question component");
    return { type: "OPTION", choiceArray };   
  },
  checkIfCorrect: () => {
    const correct = choiceArray.filter(c => c.correct).map(c => c.id);

    if (selectedAnswerChoice.length === 0) return statusTypes.INCOMP;

    const allCorrect = selectedAnswerChoice.every(id =>
      correct.includes(id)
    );

    return allCorrect ? statusTypes.COMPLE : statusTypes.INCOMP;
  }
}));


  let initChoiceArray = jsonData.choiceArray;
  if (initChoiceArray === undefined || initChoiceArray === null) {
    error.log("mcq task component does not contain choice array when it should");
  }

  const [choiceArray, setChoiceArray] = useState(initChoiceArray);

  // Precompute correct answer ids and single/multi mode
  const correctAnswerChoices = choiceArray ? choiceArray.filter((c) => c.correct === true).map((c) => String(c.id)) : [];
  const singleCorrectMode = correctAnswerChoices.length === 1;


  return (
    <div className="text-component">
      {isEditing ? (
        //Edit is true
        <Edit
          choiceArray={choiceArray}
          setChoiceArray={setChoiceArray}
          choiceApi={choiceApi}
          setChoiceApi={setChoiceApi}
        />
      ) : (
        //Edit is false
        <Use 
          choiceArray={choiceArray} 
          selectedAnswerChoice={selectedAnswerChoice?? []}
          setSelectedAnswerChoice={handleSelectAnswerChoice}
        />
      )}
    </div>
  );
});

export default MultipleChoiceComponent;
