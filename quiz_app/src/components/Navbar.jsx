import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Navbar = ({ activeUser, setActiveUser, currentUser, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    navigate("/login");
  };

  return (
    <>
      <ul className="flex justify-between items-center bg-white shadow-lg p-4 border-b border-gray-100">
        <div className="flex items-center md:ml-10 sm:ml-4">
          <li className="font-bold text-xl text-indigo-600">Quiz Generator</li>
        </div>
        <div className="flex items-center md:gap-8 sm:gap-4">
          <li className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
            <a href="/dashboard">Dashboard</a>
          </li>
          <li className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
            <a href="/">New Quiz</a>
          </li>
        </div>
        <div className="flex items-center md:gap-4 sm:gap-2 md:mr-10 sm:mr-4 relative">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block">Hi, {displayName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-gray-500 text-xs">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ul>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};
