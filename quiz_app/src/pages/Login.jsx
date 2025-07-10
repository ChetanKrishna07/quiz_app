import { useState } from "react";
import { auth, googleProvider } from "../config/firebase-config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

export const Login = ({ setIsAuthenticated, setActiveUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();

  const clearErrors = () => {
    setEmailError(false);
    setPasswordError(false);
    setGeneralError("");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    // Validation
    if (!email || !email.includes("@")) {
      setEmailError(true);
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // User creation will be handled automatically by App.jsx onAuthStateChanged
      setActiveUser(result.user.uid);
      setIsAuthenticated(true);
      navigate("/dashboard");
      console.log("User signed in successfully:", result.user);
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.code === "auth/user-not-found") {
        setGeneralError("No account found with this email. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        setGeneralError("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-credential") {
        setGeneralError("Invalid email or password. Please check your credentials.");
      } else {
        setGeneralError("Error signing in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    clearErrors();
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // User creation will be handled automatically by App.jsx onAuthStateChanged
      setActiveUser(result.user.uid);
      setIsAuthenticated(true);
      navigate("/dashboard");
      console.log("User signed in with Google successfully:", result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setGeneralError("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setGeneralError("Popup was blocked by browser. Please allow popups and try again.");
      } else if (error.code === "auth/unauthorized-domain") {
        setGeneralError("This domain is not authorized for authentication. Please contact support.");
      } else {
        setGeneralError("Error signing in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              disabled={loading}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters long.</p>
            )}
          </div>

          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {generalError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span className="font-medium text-gray-700">Sign in with Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
