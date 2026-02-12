import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        username,
        email,
        password,
      });

      navigate("/");
    } catch (err) {
      setError("Registration failed. Username or email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Card Container */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 transform animate-scale-in">
          {/* Military Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-block mb-4 text-6xl sm:text-7xl drop-shadow-lg">🪖</div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-light">Join Military Triage System</p>
            <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-amber-400 mx-auto rounded-full mt-4"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg text-red-200 text-sm font-semibold animate-slide-in-right">
              <span className="mr-2">⚠️</span>{error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                placeholder="your.email@military.gov"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.3s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Password</label>
              <input
                type="password"
                placeholder="Enter password (min 6 characters)"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.4s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-slate-900 font-bold py-3 sm:py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8 text-base sm:text-lg uppercase font-black tracking-wide"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gradient-to-r from-slate-600/0 via-slate-600 to-slate-600/0"></div>
            <span className="px-4 text-gray-400 text-xs font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-slate-600/0 via-slate-600 to-slate-600/0"></div>
          </div>

          {/* Login Link */}
          <p className="text-gray-400 text-center text-sm">
            Already have an account?{" "}
            <Link to="/" className="text-cyan-400 hover:text-blue-300 font-bold transition-colors duration-200 hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-gray-500 text-xs font-light">
          <p>Military Emergency Triage System © 2026</p>
          <p className="mt-2 text-gray-600">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
