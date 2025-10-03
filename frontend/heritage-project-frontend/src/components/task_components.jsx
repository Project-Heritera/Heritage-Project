//Task Types is the data definition of the our Task and the React Components is actually what Reactrenders 

export const MultipleChoiceQuestion = ({ questionData, onUpdate }) => {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Enter your question..."
        value={questionData.question || ''}
        onChange={(e) => onUpdate({ ...questionData, question: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
      />
      <div className="space-y-2">
        {(questionData.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((option, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input type="radio" name={`q-${questionData.id}`} className="" />
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(questionData.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'])];
                newOptions[idx] = e.target.value;
                onUpdate({ ...questionData, options: newOptions });
              }}
              className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TextInputQuestion = ({ questionData, onUpdate }) => {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Enter your question..."
        value={questionData.question || ''}
        onChange={(e) => onUpdate({ ...questionData, question: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
      />
      <input
        type="text"
        placeholder="User will type their answer here..."
        disabled
        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
      />
    </div>
  );
};


export const TextBlock = ({ questionData, onUpdate }) => {
  return (
    <div className="space-y-3">
      <textarea
        placeholder="Enter your text content here..."
        value={questionData.content || ''}
        onChange={(e) => onUpdate({ ...questionData, content: e.target.value })}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  resize-y"
      />
    </div>
  );
};



export const TASK_TYPES = [
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Question with multiple options',
    component: MultipleChoiceQuestion,
    defaultData: {
      question: '',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    }
  },
  {
    id: 'text-input',
    name: 'Text Input',
    description: 'Open-ended text question',
    component: TextInputQuestion,
    defaultData: {
      question: ''
    }
  },
  {
    id: 'text-block',
    name: 'Text Block',
    description: 'Rich text content or instructions',
    component: TextBlock,
    defaultData: {
      content: ''
    }
  },
];