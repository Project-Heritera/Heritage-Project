import React, { useState } from 'react';

//Commponet used to render the edit version of the text componet
const ChoiceButton = ({choiceId, text, isCorrect}) => {

    return (
        <button>
            {choiceId}: {text}
        </button>
    );
};

export default ChoiceButton;