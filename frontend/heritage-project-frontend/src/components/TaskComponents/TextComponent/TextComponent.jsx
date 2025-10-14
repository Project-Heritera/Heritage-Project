import React from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"
import "../../../styles/Components/TaskComponents/TextComponent.css"

//This is the overall text componet for text. 
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
const TextComponent = ({text, edit}) => {
    return (
        <div className='text-componet'>
            {edit ? (
                //Edit is true
                <Edit text={text}/>
            ) : (
                //Edit is false
                <Read text={text}/>
            )}
        </div>
    );
};

export default TextComponent;