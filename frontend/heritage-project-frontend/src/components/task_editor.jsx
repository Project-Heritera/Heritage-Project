import { useState } from "react";
import { Plus, Code, Copy } from "lucide-react";
import { Card } from "./draggable";
import { TaskSelector } from "./task_menu";

export default function TaskEditor() {
  const [cards, setCards] = useState([]); //Main STATE that holds every card and all its 
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [showJson, setShowJson] = useState(false);

  // basicsly converts card state to json
  const getJsonData = () => {
    return {
      questions: cards.map((card, index) => ({
        order: index + 1,
        id: card.id,
        type: card.type,
        ...card.data,
      })),
      metadata: {
        totalQuestions: cards.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  };

  const copyJsonToClipboard = () => {
    const jsonData = JSON.stringify(getJsonData(), null, 2);
    navigator.clipboard.writeText(jsonData);
    alert("JSON copied..");
  };


  const addNewCard = (componentType) => {
    const newCard = {
      id: nextId,
      type: componentType.id,
      data: { ...componentType.defaultData, id: nextId },
    };
    setCards([...cards, newCard]);
    setNextId(nextId + 1);
  };

  const updateCard = (cardId, newData) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, data: newData } : card
      )
    );
  };

  const deleteCard = (cardId) => {
    setCards(cards.filter((card) => card.id !== cardId));
  };



  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];

    newCards.splice(draggedIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);

    setCards(newCards);
    setDraggedIndex(null);
  };





  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Task Editor
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Code size={20} />
              {showJson ? "Hide" : "View"} JSON
            </button>
          </div>
        </div>

        {showJson && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6 relative">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 text-sm font-mono">
                Live JSON Output
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyJsonToClipboard}
                  className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>
            <pre className="text-green-400 text-sm overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(getJsonData(), null, 2)}
            </pre>
          </div>
        )}




        {cards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              No questions yet. Click the plus icon to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={draggedIndex}
                
                onUpdate={updateCard}
                onDelete={deleteCard}
              />
            ))}
          </div>
        )}
      </div>



      {showSelector && (
        <TaskSelector
          onSelect={addNewCard}
          onClose={() => setShowSelector(false)}
        />
      )}
      <button
        onClick={() => setShowSelector(true)}
        className="text-center  gap-2 px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
