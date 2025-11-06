import React, { useState } from 'react';
import Edit from './TextInputEdit'
import Use from './UseTextInput'

//Parent componet for TextInputComponet. Defines both the edit and non edit version.
const TextInputComponent = ({ serialize, jsonData, isEditing }) => {

    const givenText = jsonData.text;
    const [text, setText] = useState(isEditing ? givenText : null);//Used to provide fucntions to parent of MarkdownArea

    function handleSerialize() {
        const jsonToSerialize = JSON.stringify({
            text: text
        });
        serialize(taskComponentTypes.TEXT, jsonToSerialize);
    }

    return (
        <div className='text-componet'>
            {isEditing ? (
                //Edit is true
                <Edit text={text} setText={setText} />
            ) : (
                //Edit is false
                <Use correctText={givenText} text={text} setText={setText}/>
            )}
        </div>
    );
};

export default TextInputComponent;