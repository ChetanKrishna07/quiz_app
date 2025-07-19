import React, { useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";

export const DocumentCard = ({ doc, navigate, handleDeleteDocument }) => {
  return (
    <div
      key={doc._id}
      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer min-h-[140px] sm:min-h-[160px]"
      onClick={() => {
        navigate(`/document/${doc._id}`);
      }}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h3
          className="font-semibold text-gray-800 text-sm sm:text-lg truncate flex-1 mr-2"
          title={doc.title}
        >
          {doc.title || "Untitled Document"}
        </h3>
        <div className="flex justify-end flex-shrink-0">
          <button
            className="group relative p-1.5 sm:p-1 rounded-full hover:bg-red-100 focus:outline-none cursor-pointer touch-manipulation"
            aria-label="Delete Document"
            title="Delete Document"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card navigation
              const confirm = window.confirm(
                "Are you sure you want to delete this document?"
              );
              if (confirm) {
                handleDeleteDocument(doc._id);
              }
            }}
            type="button"
          >
            <MdDeleteForever className="text-red-500 text-lg sm:text-xl group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
          </button>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
        {doc.document_content.substring(0, 80)}...
      </p>
      
      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          {doc.topic_scores?.length || 0} topics
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          {doc.questions?.length || 0} questions
        </span>
      </div>
      
      <div className="text-xs text-gray-400">
        Created: {new Date(doc.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};
