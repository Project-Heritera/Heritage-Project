import React, { useState, useEffect } from 'react';
import Edit from "./EditImageComponent"
import Read from "./ReadImageComponent"
import "../../../styles/Components/ImageComponent/ImageComponent.css"

//This is the overall text componet for text. 
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
function TextTaskComponent ({ serialize, jsonData, isEditing })  {

    const [image, setImage] = useState(jsonData.image !== null ? jsonData.image : null);

    return (
        <div className='imageComp'>
            {isEditing ? (
                //Edit is true
                <Edit image={image} setImage={setImage}/>
            ) : (
                //Edit is false
                <Read/>
            )}
        </div>
    );
};

export default TextTaskComponent;