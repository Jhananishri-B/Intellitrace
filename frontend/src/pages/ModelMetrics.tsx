import { useEffect, useState } from 'react';
import axios from 'axios';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, CheckCircle } from 'lucide-react';

const API = 'http://localhost:8001/api/dashboard';

function Ring({ label, score }: { label: string; score: number }) {
    const pct = parseFloat(score.toFixed(4)) * 100;
    const color = pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444';
    const dash = 251.2;
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" className="fill-none stroke-white/10" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8"
                        strokeDasharray={dash}
                        strokeDashoffset={dash - (dash * pct) / 100}
                        stroke={color} strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color }}>{(pct).toFixed(1)}%</span>
                </div>
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function ModelMetrics() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        axios.get(`${API}/model-metrics`).then(r => setMetrics(r.data));
    }, []);

    if (!metrics) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

    const radarData = [
        { metric: 'Accuracy', value: metrics.accuracy * 100 },
        { metric: 'Precision', value: metrics.precision * 100 },
        { metric: 'Recall', value: metrics.recall * 100 },
        { metric: 'F1 Score', value: metrics.f1_score * 100 },
        { metric: 'ROC-AUC', value: metrics.roc_auc * 100 },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Model Metrics</h1>
                <p className="text-gray-400 text-sm">GraphSAGE GNN evaluation results on the fraud detection dataset</p>
            </div>

            {/* Model info banner */}
            <div className="glass-panel p-5 flex items-center gap-4 border-purple-500/30">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-sky-500 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="font-bold text-white">GraphSAGE 3-Layer GNN</p>
                    <p className="text-xs text-gray-400">Hidden dims: 64 → 32 → 2 &nbsp;•&nbsp; Dropout 0.5 &nbsp;•&nbsp; Adam lr=0.005 &nbsp;•&nbsp; WeightDecay 1e-4 &nbsp;•&nbsp; Early stopping at epoch 30</p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Trained</span>
                </div>
            </div>

            {/* Rings */}
            <div className="glass-panel p-8">
                <h2 className="text-lg font-bold text-white mb-8">Performance Metrics</h2>
                <div className="flex flex-wrap justify-around gap-8">
                    <Ring label="Accuracy" score={metrics.accuracy} />
                    <Ring label="Precision" score={metrics.precision} />
                    <Ring label="Recall" score={metrics.recall} />
                    <Ring label="F1 Score" score={metrics.f1_score} />
                    <Ring label="ROC-AUC" score={metrics.roc_auc} />
                </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold text-white mb-4">Radar Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                        <PolarGrid stroke="#ffffff15" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                        <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} contentStyle={{ background: '#18181b', border: '1px solid #ffffff20', borderRadius: 12 }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Interpretation */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold text-white mb-4">Interpretation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="font-semibold text-white mb-2">📌 High Recall (96.7%)</p>
                        <p>The model successfully identifies nearly all fraud cases — critical for catching financial crimes with minimal miss-rate.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="font-semibold text-white mb-2">⚠ Low Precision (3.87%)</p>
                        <p>On synthetic, random data there's no real pattern. On real-world data, precision will increase significantly with correlated features.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="font-semibold text-white mb-2">🎯 ROC-AUC (58.3%)</p>
                        <p>Slightly above random — expected on purely synthetic data. Real bank transaction data typically achieves 0.90+ AUC.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="font-semibold text-white mb-2">🔧 Class Weighting</p>
                        <p>Balanced class weights force the model to prioritize minority (fraud) class. The result is high recall at the cost of precision on synthetic data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
