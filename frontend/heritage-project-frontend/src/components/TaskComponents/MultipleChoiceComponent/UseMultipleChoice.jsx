import React, { useState } from 'react';
import ChoiceButton from './ChoiceButton';

//Commponet used to render the edit version of the text componet
const UseMultipleChoice = ({choiceArray, setChoiceArray, answerdCorrect, setAnswerdCorrect}) => {

    return (
        <div>
            {/*Create multiple choice editable form*/}
            <div>
                {choiceArray.map(choice => (
                    <div key={choice.id}>
                        <ChoiceButton  choiceId={choice.id} isCorrect={choice.correct} text={choice.text}></ChoiceButton>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UseMultipleChoice;