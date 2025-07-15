import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../utils/api";
import { Loading } from "../components/Loading";

export const Dashboard = ({ topicScores, activeUser }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Dashboard.jsx Topic Scores: ", topicScores);
    loadDocuments();
  }, [activeUser]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments(activeUser);
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getTopicColor = (score) => {
    if (score >= 7) return { bg: "bg-green-500", text: "text-green-600" };
    if (score >= 5) return { bg: "bg-yellow-500", text: "text-yellow-600" };
    if (score >= 3) return { bg: "bg-orange-500", text: "text-orange-600" };
    return { bg: "bg-red-500", text: "text-red-600" };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your learning progress across all topics
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Documents Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Your Documents
                </h2>
                <a 
                  href="/" 
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Create New Document
                </a>
              </div>
              
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => {
                        console.log("Dashboard - Navigating to document:", doc.id);
                        navigate(`/document/${doc.id}`);
                      }}
                    >
                      <h3 className="font-semibold text-gray-800 text-lg mb-2 truncate" title={doc.title}>
                        {doc.title || "Untitled Document"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {doc.document_content.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>
                          {doc.topic_scores?.length || 0} topics
                        </span>
                        <span>
                          {doc.questions?.length || 0} questions
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Documents Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first document to start building your knowledge base!
                  </p>
                  <a 
                    href="/" 
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Document
                  </a>
                </div>
              )}
            </div>

            {/* Topic Mastery Section */}
            {Object.keys(topicScores).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-6">
                  Topic Mastery Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(topicScores).map(([topic, score]) => {
                    const colors = getTopicColor(score);
                    const percentage = (score / 10) * 100;
                    
                    return (
                      <div key={topic} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800 text-lg truncate" title={topic}>
                            {topic}
                          </h3>
                          <span className={`text-lg font-bold ${colors.text}`}>
                            {score.toFixed(1)}/10
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ease-out ${colors.bg}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Mastery Level:
                          </span>
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {score >= 7 ? "Expert 🎓" : score >= 5 ? "Good 👍" : score >= 3 ? "Learning 📚" : "Beginner 🌱"}
                          </span>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Progress: {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Statistics */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(topicScores).length}
                      </div>
                      <div className="text-sm text-gray-600">Topics Studied</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(topicScores).filter(score => score >= 7).length}
                      </div>
                      <div className="text-sm text-gray-600">Expert Level</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Object.values(topicScores).filter(score => score >= 5 && score < 7).length}
                      </div>
                      <div className="text-sm text-gray-600">Good Level</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-gray-600">
                        {(Object.values(topicScores).reduce((sum, score) => sum + score, 0) / Object.keys(topicScores).length).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
