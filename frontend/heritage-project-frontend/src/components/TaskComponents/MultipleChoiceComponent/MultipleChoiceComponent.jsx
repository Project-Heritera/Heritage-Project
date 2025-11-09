import React, { useState } from "react";
import statusTypes from "../../../utils/statusTypes";
import Edit from "./EditMultipleChoice";
import Use from "./UseMultipleChoice";
import { taskComponentTypes } from "../../../utils/taskComponentTypes";

//This is the overall text componet for text.
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
const MultipleChoiceComponent = ({ serialize, jsonData, isEditing }) => {
  const [choiceApi, setChoiceApi] = useState(null); //Used to provide fucntions to parent of MarkdownArea
  const [selectedAnswerChoice, setSelectedAnswerChoice] = useState(""); //set to id of selected button for viewer

  function handleSerialize() {
    const jsonToSerialize = JSON.stringify({
      text: areaApi?.getContent(),
    });
    serialize(taskComponentTypes.TEXT, jsonToSerialize);
  }
  function checkIfCorrect() {
    if (selectedAnswerChoice == "") return statusTypes.INCOMP;

    let correctAnswerChoices = choiceArray;
    for (const choice of choiceArray) {
      if (choice.correct === true) {
        correctAnswerChoices.push(choice.id);
      }
    }
    if (correctAnswerChoices.includes(selectedAnswerChoice)) {
      return statusTypes.COMPLE;
    } else {
      return statusTypes.INCOMP;
    }
  }

  let initChoiceArray = jsonData.choiceArray;
  console.log("choiceArray is: ", initChoiceArray);
  //Check if there is already choices added else init default 2 editable choices
  //todo: from malik: you dont need to supply defailt values we alr do that in parent component. Just assume you are gettigna vlaid json
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
    <div className="text-componet">
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
            <Use choiceArray={choiceArray} />
      )}
    </div>
  );
};

export default MultipleChoiceComponent;
