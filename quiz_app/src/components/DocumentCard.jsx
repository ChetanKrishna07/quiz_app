import React, { useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";

export const DocumentCard = ({ doc, navigate, handleDeleteDocument }) => {
  return (
    <div
      key={doc._id}
      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => {
        navigate(`/document/${doc._id}`);
      }}
    >
      <div className="flex justify-between items-center">
        <h3
          className="font-semibold text-gray-800 text-lg truncate"
          title={doc.title}
        >
          {doc.title || "Untitled Document"}
        </h3>
        <div className="flex justify-end">
          <button
            className="group relative p-1 rounded-full hover:bg-red-100 focus:outline-none cursor-pointer"
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
            <MdDeleteForever className="text-red-500 text-xl group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {doc.document_content.substring(0, 100)}...
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{doc.topic_scores?.length || 0} topics</span>
        <span>{doc.questions?.length || 0} questions</span>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Created: {new Date(doc.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};
