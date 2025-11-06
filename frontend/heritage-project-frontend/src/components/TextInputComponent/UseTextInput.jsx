import React, { useState } from 'react';
import '../../styles/Components/TaskComponents/TextInputComponent.css'

//Commponet used to render the edit version of the text componet
const UseTextInput = ({text, setText, correctText} ) => {

    //Handles changes to the input
    const handleInput = (event) => {
        let newText = event.target.value
        setText(newText)
    }
    
    return (
        <div>
            <textarea className='inputBox' maxLength={correctText.length} onInput={handleInput}></textarea>
        </div>
    );
};

export default UseTextInput;