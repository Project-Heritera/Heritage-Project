import React from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"
import "../../../styles/Components/TaskComponents/TextComponent.css"

const TextComponent = ({text, edit}) => {
    return (
        <div className='text-componet'>
            {edit ? (
                //Edit is true
                <Edit text={text}/>
            ) : (
                //Edit is false
                <Edit text={text}/>
            )}
        </div>
    );
};

export default TextComponent;