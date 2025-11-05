import { useState } from "react";

function QuestionTaskComponent({ jsonData,  QuestionComponent, isEditing }) {
  const [attemptsLeft, setAttemptsLeft] = useState(jsonData.numOfChances ?? 1);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAnswer = (userAnswer) => {
    const result = QuestionComponent.checkAnswer(jsonData, userAnswer);
    if (result) setIsCorrect(true);
    else setAttemptsLeft(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="question-wrapper">
      <QuestionComponent
        jsonData={jsonData}
        isEditing={isEditing}
        onAnswer={handleAnswer}
        isCorrect={isCorrect}
      />
      {!isCorrect && attemptsLeft === 0 && jsonData.hint && (
        <p className="hint">{jsonData.hint}</p>
      )}
      {showHint && <p className="hint">{jsonData.hint}</p>}
    </div>
  );
}

export default QuestionTaskComponent;
