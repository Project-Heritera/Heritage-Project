import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import statusTypes from "@/utils/statusTypes";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const MatchTermsTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [terms, setTerms] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // termIdx -> selected answer


  useImperativeHandle(ref, () => ({
    serialize: () => {
      return { type: "MATCH", content: {"terms": terms, "answers": answers} };   
     },
  checkIfCorrect: () => {
    // Build a choiceArray like your snippet
    const choiceArray = answers.map((answer, idx) => ({
      id: idx,
      correct: userAnswers[idx] === answer,
    }));

    const selectedAnswerChoice = Object.keys(userAnswers).map(Number);

    if (selectedAnswerChoice.length === 0) return statusTypes.NOSTAR;

    const allCorrect = selectedAnswerChoice.every((id) =>
      choiceArray.find((c) => c.id === id)?.correct
    );

    return allCorrect ? statusTypes.COMPLE : statusTypes.INCOMP;
  },
}));
  // Initialize component
  useEffect(() => {
    if (!jsonData) return;
    setTerms(jsonData.terms || []);
    setAnswers(jsonData.answers || []);
  }, [jsonData]);

  // Shuffle answers for display mode
useEffect(() => {
  if (!isEditing && answers.length > 0) {
    const shuffled = [...answers]
      .map(a => ({ value: a, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(a => a.value);
    setShuffledAnswers(shuffled);
  }
}, [isEditing, answers]);


  const handleChange = (termIdx, selectedAnswer) => {
  setUserAnswers(prev => ({
    ...prev,
    [termIdx]: selectedAnswer
  }));
};

  return (
  <Card className="p-6 space-y-6">
    {isEditing ? (
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Map each term to its corresponding answer. By default, the first
          term maps to the first answer, the second term to the second answer,
          etc. Choices will be shuffled for students.
        </p>

        {terms.map((term, idx) => (
          <div key={idx} className="flex items-center gap-4">
            {/* Term input */}
            <Input
              className="w-1/3"
              value={term}
              onChange={(e) => {
                const newTerms = [...terms];
                newTerms[idx] = e.target.value;
                setTerms(newTerms);
              }}
              placeholder={`Term ${idx + 1}`}
            />

            {/* Arrow */}
            <ArrowRight size={20} className="text-muted-foreground" />

            {/* Answer input */}
            <Input
              className="w-1/3"
              value={answers[idx]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[idx] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder={`Answer ${String.fromCharCode(65 + idx)}`}
            />
          </div>
        ))}
      </CardContent>
    ) : (
      <CardContent className="flex flex-col gap-4">
        {terms.map((term, idx) => {
          // Compute which answers are already selected by other terms
          const selectedElsewhere = Object.entries(userAnswers)
            .filter(([key]) => parseInt(key) !== idx)
            .map(([_, val]) => val);

          return (
            <div key={idx} className="flex items-center gap-4 bg-white text-black dark:bg-gray-800 dark:text-white">
              <span className="w-1/3">{term}</span>
              <select
                value={userAnswers[idx] ?? ""}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="border p-2 rounded w-1/3 dark:bg-gray-800 dark:text-white"
              >
                <option value="" disabled>
                  Select...
                </option>
                {shuffledAnswers.map((choice, cIdx) => (
                  <option
                    key={cIdx}
                    value={choice}
                    disabled={selectedElsewhere.includes(choice)}
                  >
                    {String.fromCharCode(65 + cIdx)}. {choice}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </CardContent>
    )}
  </Card>
);
});

export default MatchTermsTaskComponent;
