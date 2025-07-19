import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../utils/api";
import { Loading } from "../components/Loading";
import { DocumentCard } from "../components/DocumentCard";
import { deleteDocument } from "../utils/api";

export const Dashboard = ({ topicScores, activeUser }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [activeUser]);

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2">
              Track your learning progress across all topics
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Documents Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b-2 border-gray-200 pb-2 mb-4 sm:mb-6 gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Your Documents
                  </h2>
                  <a
                    href="/"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm w-full sm:w-auto text-center"
                  >
                    Create New Document
                  </a>
                </div>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        navigate={navigate}
                        topicScores={topicScores}
                        handleDeleteDocument={handleDeleteDocument}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📄</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      No Documents Yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                      Create your first document to start building your knowledge
                      base!
                    </p>
                    <a
                      href="/"
                      className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Create Document
                    </a>
                  </div>
                )}
              </div>

              {/* Topic Mastery Section */}
              {Object.keys(topicScores).length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 sm:mb-6">
                    Topic Mastery Overview
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Object.entries(topicScores).map(([topic, score]) => {
                      const colors = getTopicColor(score);
                      const percentage = (score / 10) * 100;

                      return (
                        <div
                          key={topic}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3
                              className="font-semibold text-gray-800 text-base sm:text-lg truncate flex-1 mr-2"
                              title={topic}
                            >
                              {topic}
                            </h3>
                            <span className={`text-base sm:text-lg font-bold ${colors.text} flex-shrink-0`}>
                              {score.toFixed(1)}/10
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2 sm:mb-3">
                            <div
                              className={`h-3 sm:h-4 rounded-full transition-all duration-500 ease-out ${colors.bg}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                            <span className="text-xs sm:text-sm text-gray-600">
                              Mastery Level:
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-medium ${colors.text}`}
                            >
                              {score >= 7
                                ? "Expert 🎓"
                                : score >= 5
                                ? "Good 👍"
                                : score >= 3
                                ? "Learning 📚"
                                : "Beginner 🌱"}
                            </span>
                          </div>

                          <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                            Progress: {percentage.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Statistics */}
                  <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                      Learning Summary
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {Object.keys(topicScores).length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Topics Studied
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {
                            Object.values(topicScores).filter(
                              (score) => score >= 7
                            ).length
                          }
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Expert Level</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                          {
                            Object.values(topicScores).filter(
                              (score) => score >= 5 && score < 7
                            ).length
                          }
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Good Level</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-gray-600">
                          {(
                            Object.values(topicScores).reduce(
                              (sum, score) => sum + score,
                              0
                            ) / Object.keys(topicScores).length
                          ).toFixed(1)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Average Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
