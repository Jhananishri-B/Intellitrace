import { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
