import React, { useState } from 'react';
import '../../../styles/Components/MultipleChoiceComponet/MultipleChoiceComponet.css'
import {Plus} from 'lucide-react';

//Commponet used to render and add functionality to the plus button that adds a choice
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
        <button className='addButton' onClick={addChoice}>
            <div className='addIcon'>
                <Plus size={18} />
            </div>
        </button>
    );
};

export default PlusButton;