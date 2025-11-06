import React, { useState } from 'react';
import '../../styles/Components/TaskComponents/TextInputComponent.css'

//Commponet used to render the edit version of the text componet
const TextInputEdit = ({text, setText} ) => {

    const textAreaChange = (e) => {
        const newText = e.target.value;
        setText(newText);
    }

    return (
        <div>
            <textarea className='inputBox' value={text} onInput={textAreaChange}></textarea>
        </div>
    );
};

export default TextInputEdit;