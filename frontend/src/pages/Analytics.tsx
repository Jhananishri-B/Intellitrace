import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';

const API = 'http://localhost:8001/api/dashboard';
const PURPLE = '#8b5cf6';
const SKY = '#0ea5e9';
const RED = '#ef4444';
const AMBER = '#f59e0b';
const GREEN = '#10b981';

const COLORS = [PURPLE, SKY, RED, AMBER, GREEN];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface/90 backdrop-blur border border-white/10 rounded-xl px-4 py-3 shadow-xl text-sm">
            <p className="text-gray-400 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value?.toLocaleString()}</p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        axios.get(`${API}/analytics`).then(r => setAnalytics(r.data));
    }, []);

    if (!analytics) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
                <p className="text-gray-400 text-sm">Visual breakdown of fraud patterns and transaction flows</p>
            </div>

            {/* Row 1: Fraud by Type + Fraud by Channel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fraud by Type - Pie */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Fraud Types Distribution</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={analytics.byType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                                {analytics.byType.map((_: any, i: number) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend formatter={(v: string) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Fraud by Channel - Bar */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Fraud by Channel</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={analytics.byChannel} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="channel" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill={SKY} radius={[6, 6, 0, 0]} name="Fraud Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Amount over time - Area */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold text-white mb-6">Fraud Amount Over Time</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.overTime} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={PURPLE} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={SKY} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={SKY} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v: string) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
                        <Area type="monotone" dataKey="fraudAmount" name="Fraud Amount ($)" stroke={PURPLE} fill="url(#purpleGrad)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="normalAmount" name="Normal Amount ($)" stroke={SKY} fill="url(#skyGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Row 3: Transaction count by day - Line */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold text-white mb-6">Daily Transaction Volume</h2>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={analytics.overTime} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v: string) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
                        <Line type="monotone" dataKey="fraudCount" name="Fraud Transactions" stroke={RED} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="normalCount" name="Normal Transactions" stroke={GREEN} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
