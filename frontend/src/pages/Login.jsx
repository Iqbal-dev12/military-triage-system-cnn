import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/home");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Card Container */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 transform animate-scale-in">
          {/* Military Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-block mb-4 text-6xl sm:text-7xl drop-shadow-lg">🪖</div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-2">
              Military Triage
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-light">Emergency Assessment System</p>
            <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-cyan-400 mx-auto rounded-full mt-4"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg text-red-200 text-sm font-semibold animate-slide-in-right">
              <span className="mr-2">⚠️</span>{error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 sm:py-4 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-bold py-3 sm:py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8 text-base sm:text-lg uppercase font-black tracking-wide"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Login</span>
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

          {/* Register Link */}
          <p className="text-gray-400 text-center text-sm">
            New to the system?{" "}
            <Link to="/register" className="text-amber-400 hover:text-yellow-300 font-bold transition-colors duration-200 hover:underline">
              Create an account
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

export default Login;
