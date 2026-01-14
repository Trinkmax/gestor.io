// ================================
// INSIGHTS PANEL COMPONENT
// Actionable insights for reports
// ================================

import { useNavigate } from 'react-router-dom';
import { Lightbulb, AlertTriangle, Info, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import type { Insight } from '../utils/reportAggregations';
import './InsightsPanel.css';

interface InsightsPanelProps {
    insights: Insight[];
    title?: string;
}

const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    alert: AlertCircle
};

export function InsightsPanel({ insights, title = 'Sugerencias' }: InsightsPanelProps) {
    const navigate = useNavigate();
    
    if (insights.length === 0) {
        return (
            <div className="insights-panel empty">
                <Lightbulb size={28} />
                <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>No hay insights para mostrar</p>
            </div>
        );
    }
    
    return (
        <div className="insights-panel">
            <div className="insights-header">
                <Lightbulb size={18} />
                <h3>{title}</h3>
            </div>
            <div className="insights-list">
                {insights.map(insight => {
                    const Icon = typeIcons[insight.type];
                    return (
                        <div 
                            key={insight.id} 
                            className={`insight-item ${insight.type}`}
                            onClick={() => insight.actionPath && navigate(insight.actionPath)}
                            role={insight.actionPath ? 'button' : undefined}
                            tabIndex={insight.actionPath ? 0 : undefined}
                        >
                            <div className={`insight-icon ${insight.type}`}>
                                <Icon size={18} />
                            </div>
                            <div className="insight-content">
                                <span className="insight-title">{insight.title}</span>
                                <span className="insight-description">{insight.description}</span>
                            </div>
                            {insight.actionLabel && (
                                <button className="insight-action">
                                    {insight.actionLabel}
                                    <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
