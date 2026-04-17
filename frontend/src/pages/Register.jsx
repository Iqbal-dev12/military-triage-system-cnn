import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get role from state or localStorage
  const role = location.state?.role || localStorage.getItem("role") || "patient";

  useEffect(() => {
    if (location.state?.role) {
      localStorage.setItem("role", location.state.role);
    }
  }, [location.state]);

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
        role: role
      });

      navigate("/login", { state: { role, msg: "Registration successful! Please login." } });
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Try a different username/email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const themeColor = role === "doctor" ? "amber-400" : "cyan-400";
  const emoji = role === "doctor" ? "🩺" : "🏥";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="absolute top-6 left-6">
        <Link to="/login" state={{ role }} className="text-gray-400 hover:text-white flex items-center gap-2 group transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Login
        </Link>
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 transform animate-scale-in">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-block mb-4 text-6xl drop-shadow-lg">{emoji}</div>
            <h1 className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-${themeColor} via-white to-${themeColor} mb-2`}>
              {roleLabel} Register
            </h1>
            <p className="text-sm text-gray-300 font-light italic">Join Security Network</p>
            <div className={`h-1 w-16 bg-gradient-to-r from-${themeColor} to-transparent mx-auto rounded-full mt-4`}></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg text-red-200 text-sm font-semibold animate-slide-in-right">
              <span className="mr-2">⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-widest">Username</label>
              <input
                type="text"
                placeholder="Choose username"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-widest">Email</label>
              <input
                type="email"
                placeholder="your.email@military.gov"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-widest">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-widest">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${role === 'doctor' ? 'from-amber-500 to-yellow-400' : 'from-cyan-500 to-blue-400'} text-slate-900 font-black py-4 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-3 mt-4`}
            >
              {loading ? "Processing..." : `Register as ${roleLabel}`}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">account setup</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <p className="text-gray-400 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" state={{ role }} className={`text-${themeColor} font-bold hover:underline transition-all`}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
