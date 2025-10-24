import React, { useState } from 'react';

//Commponet used to render the edit version of the text componet
const DeleteButton = ({choiceArray, setChoiceArray, choiceApi, setChoiceApi, choiceId} ) => {

    //Delete choice
    const deleteChoice = () => {
        setChoiceArray(prevChoices => {
            //loop through each choice to find the one we want to update in the array using .filter
            const filterdChoices = prevChoices.filter(choice => choice.id !== choiceId);
            //loop through again to update index
            const reIndexedChoices =  filterdChoices.map((choice, index) => {
                return {...choice, id: String.fromCharCode((index) + 97)};
            })

            return reIndexedChoices;
        }
        ); 
    };

    return (
        <button onClick={deleteChoice}>Delete</button>
    );
};

export default DeleteButton;