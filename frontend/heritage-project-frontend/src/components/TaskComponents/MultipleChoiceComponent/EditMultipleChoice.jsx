import React, { useState } from 'react';

//Commponet used to render the edit version of the text componet
const EditMultipleChoice = ({choiceArray, setChoiceArray, choiceApi, setChoiceApi} ) => {

    console.log('rendering edit for multi choice');

    //Handles updates for the checkboxes
    const updateCheckmark = (checkbox, choiceId) => {
        setChoiceArray(prevChoices =>
            //loop through each choice to find the one we want to update in the array using .map
            prevChoices.map(choice => {
                if (choiceId === choice.id) {
                    //found the right choice
                    console.log("Updated checkbox to: ", checkbox.checked)
                    return {...choice, correct: checkbox.checked};
                }
                return choice;//Not what we are looking for so keep this as current value
            })
        ); 
    };

    //Handles updates for the textboxes for each qeustion.
    const updateText = (text, choiceId) => {
        console.log("Updating text for: ", choiceId)
        console.log("New text is: ", text)
        setChoiceArray(prevChoices =>
            //loop through each choice to find the one we want to update in the array using .map
            prevChoices.map(choice => {
                if (choiceId === choice.id) {
                    //found the right choice
                    return {...choice, text: text};
                }
                return choice;//Not what we are looking for so keep this as current value
            })
        ); 
    };

    return (
        <div>
            {/*Create multiple choice editable form*/}
            <div>
                {choiceArray.map(choice => (
                    <div key={choice.id}>
                        <input type = "text" onChange={(event) => updateText(event.target.value, choice.id)}/>
                        <input type = "checkbox" onChange={(event) => updateCheckmark(event.target, choice.id)}/>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default EditMultipleChoice;