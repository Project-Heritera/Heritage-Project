import React from 'react';
import ChoiceButton from './ChoiceButton';

//Component used to render the user side of the component
const UseMultipleChoice = ({choiceArray, selectedAnswerChoice, setSelectedAnswerChoice}) => {

    return (
        <div>
            {/*Create multiple choice form*/}
            <div>
                {choiceArray.map(choice => (
                    <div key={choice.id}>
                        <ChoiceButton  
                            choiceId={choice.id} 
                            isCorrect={choice.correct} 
                            text={choice.text}
                            selected={selectedAnswerChoice === choice.id}
                            onClick={() => setSelectedAnswerChoice(choice.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UseMultipleChoice;