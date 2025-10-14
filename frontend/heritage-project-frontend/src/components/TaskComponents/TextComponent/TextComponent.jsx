import React, { useState } from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"
import "../../../styles/Components/TaskComponents/TextComponent.css"

//This is the overall text componet for text. 
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
const TextComponent = ({ serialize, jsonData, isEditing }) => {

    const [areaApi, setAreaApi] = useState(null);//Used to provide fucntions to parent of MarkdownArea

    function handleSerialize() {
        const jsonToSerialize = JSON.stringify({
            text: areaApi?.getContent()
        });
        serialize(taskComponentTypes.TEXT, jsonToSerialize);
    }

    const text = jsonData.text

    return (
        <div className='text-componet'>
            {isEditing ? (
                //Edit is true
                <Edit text={text} areaApi={areaApi} setAreaApi={setAreaApi} />
            ) : (
                //Edit is false
                <Read text={text} />
            )}
        </div>
    );
};

export default TextComponent;