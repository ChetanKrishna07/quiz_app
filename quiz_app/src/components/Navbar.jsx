import React, { useState } from "react";

export const Navbar = () => {
  const [user, setUser] = useState(null);
  return (
    <>
      <ul className="flex justify-between items-center bg-white shadow-lg p-4 border-b border-gray-100">
        <div className="flex items-center md:ml-10 sm:ml-4">
          <li className="font-bold text-xl">Quiz Generator</li>
        </div>
        <div className="flex items-center md:gap-50 sm:gap-20">
          <li className="text-black hover:text-gray-600 cursor-pointer">
            Dashboard
          </li>
          <li className="text-black hover:text-gray-600 cursor-pointer">
            <a href="/">New Quiz</a>
          </li>
        </div>
        <div className="flex items-center md:gap-4 sm:gap-2 md:mr-10 sm:mr-4">
          {user && <li>Profile</li>}
          {!user && (
            <li>
              <button className="text-black hover:text-gray-600 cursor-pointer">
                Login
              </button>
            </li>
          )}
          {!user && (
            <li>
              <button className="text-sm font-medium bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer transition-colors">
                Sign Up
              </button>
            </li>
          )}
        </div>
      </ul>
    </>
  );
};
