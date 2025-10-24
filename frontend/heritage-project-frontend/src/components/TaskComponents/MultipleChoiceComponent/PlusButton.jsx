import React, { useState } from 'react';

//Commponet used to render the edit version of the text componet
const PlusButton = ({choiceArray, setChoiceArray, choiceApi, setChoiceApi} ) => {

    //add choice
    const addChoice = () => {
        //use from charcode and do a +96 to get the coresponding letter to the index
        const newIdNumber = choiceArray.length;
        //prevent multiple choice from exceeding alphabet
        const lastLetter = 26//A
        if (newIdNumber >= lastLetter) {
            return;
        }

        const newId = String.fromCharCode(choiceArray.length + 97);
        const newChoice = {id: newId, text: 'Edit Text', correct: false};

        setChoiceArray(prevChoices => [...prevChoices, newChoice]);
    }

    return (
        <button onClick={addChoice}>Add</button>
    );
};

export default PlusButton;