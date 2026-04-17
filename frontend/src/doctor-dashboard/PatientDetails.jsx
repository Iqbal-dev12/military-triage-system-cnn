import React from 'react';

const getSurvivalDetails = (status, survivalProb) => {
    const conf = (survivalProb || 0) / 100;
    let chance = 0;
    let label = "";

    switch (status?.toUpperCase()) {
        case 'GREEN':
            chance = 90 + (conf * 10);
            label = "Stable";
            break;
        case 'YELLOW':
            chance = 50 + (conf * 30);
            label = "Moderate Risk";
            break;
        case 'RED':
            chance = 50 - (conf * 40);
            label = "Critical";
            break;
        case 'BLACK':
            chance = 10 - (conf * 9);
            label = "No Survival Likely";
            break;
        default:
            return { chance: "N/A", label: "Unknown" };
    }
    return { chance: `${chance.toFixed(1)}%`, label };
};

const PatientDetails = ({ patient, onClose, onViewHistory }) => {
    if (!patient) return null;
    const { chance, label } = getSurvivalDetails(patient.status, patient.survivalProbability);

    return (
        <div className="details-overlay" onClick={onClose}>
            <div className="details-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.1rem' }}>
                    {patient.status} - {label}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <p style={{ color: '#94a3b8', margin: 0 }}>ID: {patient.patientId}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                        ⏰ {new Date(patient.timestamp).toLocaleString()}
                    </p>
                </div>

                <div className="vital-grid">
                    <div className="vital-item">
                        <div className="vital-label">SpO2</div>
                        <div className="vital-value">{patient.spo2}%</div>
                    </div>
                    <div className="vital-item">
                        <div className="vital-label">Heart Rate</div>
                        <div className="vital-value">{patient.heartRate} bpm</div>
                    </div>
                    <div className="vital-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="vital-label">Survival Chance</div>
                        <div className="vital-value" style={{ color: '#10b981' }}>{chance}</div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', color: '#94a3b8' }}>
                        AI Confidence Scores
                    </h3>
                    <div style={{ spaceY: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span>Image Analysis</span>
                                <span>{(patient.imageScore * 100).toFixed(1)}%</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-fill" style={{ width: `${patient.imageScore * 100}%` }}></div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span>Audio Analysis</span>
                                <span>{(patient.audioScore * 100).toFixed(1)}%</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-fill" style={{ width: `${patient.audioScore * 100}%`, background: '#fbbf24' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>
                        RECOMMENDATION
                    </h3>
                    <p style={{ fontSize: '0.925rem', lineHeight: '1.5' }}>{patient.recommendation}</p>
                </div>

                <button
                    className="history-btn"
                    onClick={onViewHistory}
                    style={{ marginTop: '2rem' }}
                >
                    📜 View Full Clinical History
                </button>
            </div>
        </div>
    );
};

export default PatientDetails;
