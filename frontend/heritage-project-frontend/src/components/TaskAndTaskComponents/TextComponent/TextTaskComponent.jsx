import React, { useState, useEffect } from 'react';
import Edit from "./EditTextComponet"
import Read from "./ReadTextComponent"
import "../../../styles/Components/TaskComponents/TextComponent.css"
import PropTypes from 'prop-types';
import { getComponentTypeSchema, taskComponentTypes } from '../../../utils/taskComponentTypes';
TextTaskComponent.propTypes = {
  serialize: PropTypes.func.isRequired,
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};
//This is the overall text componet for text. 
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
function TextTaskComponent ({ serialize, jsonData, isEditing })  {
    const [areaApi, setAreaApi] = useState(null);//Used to provide fucntions to parent of MarkdownArea
    const text = ""
    // Load jsonData into local state on component creation
    useEffect(() => {
        if (jsonData) {
        try {
            const schema = getComponentTypeSchema(taskComponentTypes.TEXT);
            const parsed = schema.parse(jsonData);
            if (!("text" in parsed)) {
            throw new Error("Text field missing in unserialized data.");
            }
            const text = jsonData.text
        } catch (err) {
            console.error("Failed to load TextEditor:", err);
            // Kill component
            //maybe add text = ""
        }
        }
    }, []);
    
    function handleSerialize() {
        const jsonToSerialize = JSON.stringify({
            text: areaApi?.getContent()
        });
        serialize(taskComponentTypes.TEXT, jsonToSerialize);
    }


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

export default TextTaskComponent;