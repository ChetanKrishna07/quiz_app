import React from "react";
import { createPortal } from "react-dom";

export const Loading = () =>
  createPortal(
    <div className="fixed inset-0 bg-gray-400 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-green-500"></div>
    </div>,
    document.body
  );
