import React, { useState, useEffect } from "react";

export const TopicSelectionModal = ({ 
  isOpen, 
  onClose, 
  extractedTopics, 
  onGenerateQuiz 
}) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);

  console.log("TopicSelectionModal.jsx Extracted topics: ", extractedTopics);
  console.log("TopicSelectionModal.jsx Selected topics: ", selectedTopics);
  console.log("TopicSelectionModal.jsx Is Open: ", isOpen);

  // Sync selectedTopics with extractedTopics when modal opens
  useEffect(() => {
    if (isOpen && extractedTopics && extractedTopics.length > 0) {
      console.log("TopicSelectionModal.jsx useEffect: Setting topics", extractedTopics);
      setSelectedTopics([...extractedTopics]);
    }
  }, [isOpen, extractedTopics]);

  const removeTopic = (indexToRemove) => {
    setSelectedTopics(selectedTopics.filter((_, index) => index !== indexToRemove));
  };

  const addTopic = () => {
    if (newTopic.trim() && !selectedTopics.includes(newTopic.trim())) {
      setSelectedTopics([...selectedTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTopic();
    }
  };

  const handleGenerateQuiz = () => {
    if (selectedTopics.length > 0) {
      onGenerateQuiz(selectedTopics, numQuestions);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customize Your Quiz</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Topics Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Topics</h3>
            {selectedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 group hover:bg-blue-200 transition-colors"
                  >
                    <span className="text-sm font-medium">{topic}</span>
                    <button
                      onClick={() => removeTopic(index)}
                      className="text-blue-600 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4 italic">No topics selected. Add some topics below to create your quiz.</p>
            )}

            {/* Add New Topic */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new topic..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addTopic}
                disabled={!newTopic.trim()}
                className="quiz-btn"
              >
                Add
              </button>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={25}>25 Questions</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={selectedTopics.length === 0}
              className="quiz-btn"
            >
              Generate Quiz ({selectedTopics.length} topics, {numQuestions} questions)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
