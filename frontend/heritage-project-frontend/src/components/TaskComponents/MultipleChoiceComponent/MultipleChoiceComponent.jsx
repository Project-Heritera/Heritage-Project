import React, { useState, forwardRef, useImperativeHandle } from "react";
import statusTypes from "../../../utils/statusTypes";
import Edit from "./EditMultipleChoice";
import Use from "./UseMultipleChoice";
import { taskComponentTypes } from "../../../utils/taskComponentTypes";

const MultipleChoiceComponent = forwardRef(({ serialize, jsonData, isEditing }, ref) => {
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


  function handleSerialize() {
    const jsonToSerialize = JSON.stringify({
      text: areaApi?.getContent(),
    });
    serialize(taskComponentTypes.TEXT, jsonToSerialize);
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

  // Expose checkIfCorrect to parent via ref
  useImperativeHandle(ref, () => ({
    checkIfCorrect,
  }));

  let initChoiceArray = jsonData.choiceArray;
  console.log("choiceArray is: ", initChoiceArray);
  //Check if there is already choices added else init default 2 editable choices
  //todo: from malik: you dont need to supply default values we alr do that in parent component. Just assume you are getting a valid json
  if (initChoiceArray === undefined || initChoiceArray === null) {
    console.log("array was null adding init values");
    initChoiceArray = [
      { id: "a", text: "Edit Text", correct: false },
      { id: "b", text: "Edit Text", correct: false },
    ];
  }

  const [choiceArray, setChoiceArray] = useState(initChoiceArray);
  //Handle non edit case where user submits their choice

  console.log("Am I editing?", isEditing);

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
