import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, Users, TrendingUp } from 'lucide-react';

const API = 'http://localhost:8001/api/dashboard';

function MetricCard({ title, value, icon, sub, accent = false }: any) {
    return (
        <div className={`glass-panel p-6 relative overflow-hidden group`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity ${accent ? 'bg-red-500' : 'bg-purple-500'}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">{icon}</div>
                {sub && <span className={`text-xs font-bold px-2 py-1 rounded-full ${accent ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{sub}</span>}
            </div>
            <p className="text-sm text-gray-400 mb-1 font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
    );
}

export default function Overview() {
    const [stats, setStats] = useState<any>(null);
    const [frauds, setFrauds] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/stats`),
            axios.get(`${API}/recent-frauds`),
        ]).then(([s, f]) => { setStats(s.data); setFrauds(f.data); });
    }, []);

    if (!stats) return <div className="flex items-center justify-center h-full"><Activity className="w-8 h-8 text-purple-400 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
                <p className="text-gray-400 text-sm">Real-time fraud detection summary</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard title="Total Transactions" value={stats.totalTransactions.toLocaleString()} icon={<Activity className="w-5 h-5 text-purple-400" />} sub="+24%" />
                <MetricCard title="Fraud Detected" value={stats.totalFraud.toLocaleString()} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} sub="Critical" accent />
                <MetricCard title="Fraud Rate" value={`${stats.fraudRate}%`} icon={<TrendingUp className="w-5 h-5 text-sky-400" />} sub="Live" />
                <MetricCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={<Users className="w-5 h-5 text-emerald-400" />} sub="+1.2%" />
            </div>

            {/* Live Fraud Feed */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Live Threat Feed
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                                <th className="text-left pb-3 font-medium">Transaction</th>
                                <th className="text-left pb-3 font-medium">Sender → Receiver</th>
                                <th className="text-left pb-3 font-medium">Amount</th>
                                <th className="text-left pb-3 font-medium">Channel</th>
                                <th className="text-left pb-3 font-medium">Fraud Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {frauds.slice(0, 20).map((f, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 font-mono text-purple-300">{f.transaction_id}</td>
                                    <td className="py-3 text-gray-300">{f.sender_account_id} → {f.receiver_account_id}</td>
                                    <td className="py-3 font-semibold text-white">${Number(f.amount).toLocaleString()}</td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 rounded-md bg-white/5 text-gray-300 text-xs">{f.channel}</span>
                                    </td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{f.fraud_type}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
