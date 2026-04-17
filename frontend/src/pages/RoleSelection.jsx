import React from "react";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        localStorage.setItem("role", role);
        navigate("/login", { state: { role } });
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
            </div>

            <div className="relative w-full max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="mb-12 animate-fade-in">
                    <div className="text-8xl mb-6 drop-shadow-2xl">🪖</div>
                    <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-4 tracking-tight">
                        Military Triage System
                    </h1>
                    <p className="text-xl text-gray-300 font-light max-w-lg mx-auto">
                        Select your access level to enter the secure emergency assessment portal.
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 to-cyan-400 mx-auto rounded-full mt-8"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-scale-in">
                    {/* Patient Card */}
                    <button
                        onClick={() => handleRoleSelect("patient")}
                        className="group relative bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl p-10 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">🏥</div>
                            <h2 className="text-2xl font-bold text-cyan-400 mb-3 uppercase tracking-wider">Patient</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Emergency injury reporting and multi-modal triage assessment.
                            </p>
                        </div>
                    </button>

                    {/* Doctor Card */}
                    <button
                        onClick={() => handleRoleSelect("doctor")}
                        className="group relative bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl p-10 rounded-3xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-500 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">🩺</div>
                            <h2 className="text-2xl font-bold text-amber-500 mb-3 uppercase tracking-wider">Doctor</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Live monitoring, patient table, and professional triage metrics.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="mt-16 text-gray-500 text-xs font-light tracking-widest uppercase">
                    <p>© 2026 Military Emergency Triage Core</p>
                    <p className="mt-2 text-slate-600">Secure Biometric & AI-Powered Assessment</p>
                </div>
            </div>
        </div>
    );
}

export default RoleSelection;
