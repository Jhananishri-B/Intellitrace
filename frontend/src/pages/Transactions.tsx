import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const API = 'http://localhost:8001/api/dashboard';
const PAGE_SIZE = 20;

export default function Transactions() {
    const [tab, setTab] = useState<'all' | 'fraud'>('all');
    const [allTx, setAllTx] = useState<any[]>([]);
    const [fraudTx, setFraudTx] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);

    useEffect(() => {
        axios.get(`${API}/recent-frauds`).then(r => setFraudTx(r.data));
        axios.get(`${API}/transactions`).then(r => setAllTx(r.data));
    }, []);

    const source = tab === 'fraud' ? fraudTx : allTx;
    const filtered = source.filter(t =>
        Object.values(t).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    );
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
                <p className="text-gray-400 text-sm">Browse and search transaction records</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(['all', 'fraud'] as const).map(t => (
                    <button key={t} onClick={() => { setTab(t); setPage(0); }}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t
                            ? 'bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}>
                        {t === 'all' ? 'All Transactions' : '⚠ Fraud Only'}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="glass-panel px-4 py-3 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by account ID, amount, channel, type..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                />
            </div>

            {/* Table */}
            <div className="glass-panel p-6 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                            <th className="pb-3 text-left">Tx ID</th>
                            <th className="pb-3 text-left">Sender</th>
                            <th className="pb-3 text-left">Receiver</th>
                            <th className="pb-3 text-right">Amount</th>
                            <th className="pb-3 text-left pl-4">Channel</th>
                            <th className="pb-3 text-left">Time</th>
                            <th className="pb-3 text-center">Fraud</th>
                            {tab === 'fraud' && <th className="pb-3 text-left">Type</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginated.map((f, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 font-mono text-purple-300 text-xs">{f.transaction_id}</td>
                                <td className="py-3 text-gray-300">{f.sender_account_id}</td>
                                <td className="py-3 text-gray-300">{f.receiver_account_id}</td>
                                <td className="py-3 text-right font-semibold text-white">${Number(f.amount).toLocaleString()}</td>
                                <td className="py-3 pl-4"><span className="px-2 py-1 rounded-md bg-white/5 text-gray-300 text-xs">{f.channel}</span></td>
                                <td className="py-3 text-gray-400 text-xs">{f.timestamp}</td>
                                <td className="py-3 text-center">{f.is_fraud == 1 ? <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">YES</span> : <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">NO</span>}</td>
                                {tab === 'fraud' && <td className="py-3"><span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{f.fraud_type}</span></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400">{filtered.length} records found</p>
                    <div className="flex items-center gap-3">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-300 font-medium">Page {page + 1} / {Math.max(totalPages, 1)}</span>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
