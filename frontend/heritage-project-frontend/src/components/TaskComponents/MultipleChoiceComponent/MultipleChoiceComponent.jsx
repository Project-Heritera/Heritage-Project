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
  // store selected answer ids as an array to support single- and multi-select modes
  const [selectedAnswerChoices, setSelectedAnswerChoices] = useState([]);
  // after submit, reveal which selections were correct/incorrect
  const [revealedCorrect, setRevealedCorrect] = useState(new Set());
  const [revealedIncorrect, setRevealedIncorrect] = useState(new Set());

  function handleSerialize() {
    const jsonToSerialize = JSON.stringify({
      text: areaApi?.getContent(),
    });
    serialize(taskComponentTypes.TEXT, jsonToSerialize);
  }

  function checkIfCorrect() {
    // If no selection made
    if (!selectedAnswerChoices || selectedAnswerChoices.length === 0) return statusTypes.INCOMP;

    // For comparisons we use string ids
    const selectedSet = new Set(selectedAnswerChoices.map((s) => String(s)));
    const correctSet = new Set(correctAnswerChoices.map((c) => String(c)));

    // compute revealed sets for UI
    const newRevealedCorrect = new Set();
    const newRevealedIncorrect = new Set();

    // mark selected choices as correct/incorrect
    for (const s of selectedSet) {
      if (correctSet.has(s)) newRevealedCorrect.add(s);
      else newRevealedIncorrect.add(s);
    }

    setRevealedCorrect(newRevealedCorrect);
    setRevealedIncorrect(newRevealedIncorrect);

    // If any selected choice is incorrect, immediately return INCOMP
    for (const s of selectedSet) if (!correctSet.has(s)) return statusTypes.INCOMP;

    // Multi-correct mode: require exact match of sets
    if (correctSet.size > 1) {
      if (selectedSet.size !== correctSet.size) return statusTypes.INCOMP;
      for (const c of correctSet) if (!selectedSet.has(c)) return statusTypes.INCOMP;
      return statusTypes.COMPLE;
    }

    // Single-correct mode: allow only one selection, and it must be correct
    if (selectedSet.size === 1) return statusTypes.COMPLE;
    return statusTypes.INCOMP;
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
          selectedAnswerChoices={selectedAnswerChoices}
          setSelectedAnswerChoices={setSelectedAnswerChoices}
          singleCorrectMode={singleCorrectMode}
          revealedCorrect={revealedCorrect}
          revealedIncorrect={revealedIncorrect}
        />
      )}
    </div>
  );
});

export default MultipleChoiceComponent;
