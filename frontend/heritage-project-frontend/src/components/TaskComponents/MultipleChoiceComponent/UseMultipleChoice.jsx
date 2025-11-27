import React from 'react';
import ChoiceButton from './ChoiceButton';

//Component used to render the user side of the component
const UseMultipleChoice = ({choiceArray, selectedAnswerChoices, setSelectedAnswerChoices, revealedCorrect, revealedIncorrect, singleCorrectMode}) => {

    const toggleChoice = (id) => {
        const asString = String(id);
        const exists = selectedAnswerChoices.includes(asString);

        if (singleCorrectMode) {
            // single-correct mode: selecting any choice replaces previous selection
            if (exists) {
                setSelectedAnswerChoices([]);
            } else {
                setSelectedAnswerChoices([asString]);
            }
            return;
        }

        if (exists) {
            setSelectedAnswerChoices(selectedAnswerChoices.filter((s) => s !== asString));
        } else {
            setSelectedAnswerChoices([...selectedAnswerChoices, asString]);
        }
    }

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
                            selected={selectedAnswerChoice.includes(choice.id)}
                            onClick={() => setSelectedAnswerChoice(choice.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UseMultipleChoice;