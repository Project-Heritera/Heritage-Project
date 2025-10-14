import React from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"
import "../../../styles/Components/TaskComponents/TextComponent.css"

const TextComponent = ({text, edit, contentApi}) => {
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