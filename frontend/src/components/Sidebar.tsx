import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, List, Brain, ShieldAlert
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/transactions', icon: List, label: 'Transactions' },
    { to: '/model', icon: Brain, label: 'Model Metrics' },
];

export default function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-surface/60 backdrop-blur-2xl border-r border-white/10 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-sky-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">IntelliTrace</h1>
                    <p className="text-xs text-gray-500">Fraud Intelligence</p>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
              ${isActive
                                ? 'bg-gradient-to-r from-purple-600/30 to-sky-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-400 font-medium">System Active</span>
                </div>
            </div>
        </aside>
    );
}
