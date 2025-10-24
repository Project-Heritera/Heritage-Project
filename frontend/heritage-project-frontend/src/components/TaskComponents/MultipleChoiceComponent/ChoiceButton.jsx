import React, { useState } from 'react';

//Commponet used to render the choice button for the reading side of the componet
const ChoiceButton = ({choiceId, text, isCorrect}) => {

    return (
        <button>
            {choiceId}: {text}
        </button>
    );
};

export default ChoiceButton;