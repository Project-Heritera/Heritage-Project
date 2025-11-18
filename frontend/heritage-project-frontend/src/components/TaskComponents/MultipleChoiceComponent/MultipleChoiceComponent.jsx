import React, { useState, forwardRef, useImperativeHandle } from "react";
import statusTypes from "../../../utils/statusTypes";
import Edit from "./EditMultipleChoice";
import Use from "./UseMultipleChoice";
import { taskComponentTypes } from "../../../utils/taskComponentTypes";

//This is the overall text component for text.
//text is the initial text if any used to load into the read or editor
//edit is the toggle for weather its editable or not
const MultipleChoiceComponent = forwardRef(({ serialize, jsonData, isEditing }, ref) => {
  const [choiceApi, setChoiceApi] = useState(null); //Used to provide functions to parent of MarkdownArea
  const [selectedAnswerChoice, setSelectedAnswerChoice] = useState(""); //set to id of selected button for viewer

  function handleSerialize() {
    const jsonToSerialize = JSON.stringify({
      text: areaApi?.getContent(),
    });
    serialize(taskComponentTypes.TEXT, jsonToSerialize);
  }

  function checkIfCorrect() {
    if (selectedAnswerChoice === "") return statusTypes.INCOMP;

    let correctAnswerChoices = [];
    for (const choice of choiceArray) {
      if (choice.correct === true) {
        correctAnswerChoices.push(choice.id);
      }
    }
    if (correctAnswerChoices.includes(selectedAnswerChoice)) {
      console.log("Complete")
      return statusTypes.COMPLE;
    } else {
      console.log("Incomplete")
      return statusTypes.INCOMP;
    }
  }

  // Expose checkIfCorrect to parent via ref
  useImperativeHandle(ref, () => ({
    checkIfCorrect,
  }));

  let initChoiceArray = jsonData.choiceArray;
  if (initChoiceArray === undefined || initChoiceArray === null) {
    error.log("mcq task component does not contain choice array when it should");
  }

  const [choiceArray, setChoiceArray] = useState(initChoiceArray);


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
          selectedAnswerChoice={selectedAnswerChoice}
          setSelectedAnswerChoice={setSelectedAnswerChoice}
        />
      )}
    </div>
  );
});

export default MultipleChoiceComponent;
