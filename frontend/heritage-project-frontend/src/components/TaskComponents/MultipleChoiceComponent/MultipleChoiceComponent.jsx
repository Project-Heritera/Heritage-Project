import React, { useState } from 'react';
import Edit from './EditMultipleChoice';
import Use from './UseMultipleChoice'

//This is the overall text componet for text. 
//text is the initial text if any used to laod into the read or editor
//edit is the toggle for weather its editable or not
const MultipleChoiceComponent = ({ serialize, jsonData, isEditing }) => {

    const [choiceApi, setChoiceApi] = useState(null);//Used to provide fucntions to parent of MarkdownArea

    function handleSerialize() {
        const jsonToSerialize = JSON.stringify({
            text: areaApi?.getContent()
        });
        serialize(taskComponentTypes.TEXT, jsonToSerialize);
    }

    let initChoiceArray = jsonData.choiceArray;
    console.log('choiceArray is: ', initChoiceArray)
    //Check if there is already choices added else init default 2 editable choices
    if (initChoiceArray === undefined || initChoiceArray === null) {
        console.log("array was null adding init values")
        initChoiceArray = [
            {id: 'a', text: 'Edit Text', correct: false},
            {id: 'b', text: 'Edit Text', correct: false}
        ]
    }

    const [choiceArray, setChoiceArray] = useState(initChoiceArray);
    
    console.log('Am I editing?', isEditing);

    return (
        <div className='text-componet'>
            {isEditing ? (
                //Edit is true
                <Edit choiceArray={choiceArray} setChoiceArray={setChoiceArray} choiceApi={choiceApi} setChoiceApi={setChoiceApi} />
            ) : (
                //Edit is false
                <Use choiceArray={choiceArray}/>
            )}
        </div>
    );
};

export default MultipleChoiceComponent;