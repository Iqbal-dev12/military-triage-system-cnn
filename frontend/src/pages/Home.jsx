import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-block mb-6 text-7xl sm:text-8xl drop-shadow-lg animate-float">🪖</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-4 animate-slide-in-left">
              Military AI Triage System
            </h1>
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-amber-400 to-cyan-400 mx-auto mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light mb-10 animate-slide-in-right">
              AI-powered multi-modal emergency assessment using Image, Audio, Text and Vitals Analysis
            </p>

            <button
              onClick={() => navigate("/triage")}
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg sm:text-xl uppercase tracking-wide font-black animate-pulse"
            >
              <span>🚑</span> Start Triage Assessment
            </button>
          </div>
        </div>

        {/* TRIAGE LEVELS */}
        <div className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-200 mb-12 sm:mb-16 animate-fade-in">
              Triage Classification Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* GREEN */}
              <div className="group relative animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300 group-hover:blur-2xl"></div>
                <div className="relative bg-green-700/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl hover:shadow-green-500/50 border border-green-500/30 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300">
                  <h3 className="text-3xl font-bold text-white mb-3">🟢</h3>
                  <h2 className="text-2xl font-bold text-white mb-2">Green</h2>
                  <p className="text-gray-100 text-sm mb-4">Minor injuries requiring standard care</p>
                  <div className="text-xs text-green-200 font-semibold uppercase tracking-wide">Delayed Priority</div>
                </div>
              </div>

              {/* YELLOW */}
              <div className="group relative animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300 group-hover:blur-2xl"></div>
                <div className="relative bg-yellow-600/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl hover:shadow-yellow-500/50 border border-yellow-500/30 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">🟡</h3>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Yellow</h2>
                  <p className="text-gray-900 text-sm mb-4">Moderate injuries requiring prompt treatment</p>
                  <div className="text-xs text-yellow-700 font-semibold uppercase tracking-wide">Urgent Priority</div>
                </div>
              </div>

              {/* RED */}
              <div className="group relative animate-slide-in-right" style={{animationDelay: '0.3s'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300 group-hover:blur-2xl"></div>
                <div className="relative bg-red-700/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl hover:shadow-red-500/50 border border-red-500/30 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300 animate-pulse-glow">
                  <h3 className="text-3xl font-bold text-white mb-3">🔴</h3>
                  <h2 className="text-2xl font-bold text-white mb-2">Red</h2>
                  <p className="text-gray-100 text-sm mb-4">Severe injuries requiring immediate care</p>
                  <div className="text-xs text-red-200 font-semibold uppercase tracking-wide animate-pulse">Immediate Priority</div>
                </div>
              </div>

              {/* BLACK */}
              <div className="group relative animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300 group-hover:blur-2xl"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl hover:shadow-gray-500/50 border border-gray-500/30 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300">
                  <h3 className="text-3xl font-bold text-white mb-3">⚫</h3>
                  <h2 className="text-2xl font-bold text-white mb-2">Black</h2>
                  <p className="text-gray-300 text-sm mb-4">Non-survivable injuries - expectant care</p>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Expectant Priority</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-700/50 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm font-light">Authorized Military Personnel Only</p>
            <button
              onClick={logout}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 uppercase font-black tracking-wide"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
