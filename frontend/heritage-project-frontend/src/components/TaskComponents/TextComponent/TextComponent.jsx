import React from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"

const TextComponent = ({text, edit}) => {
    return (
        <div>
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