'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const LOGO_PATH = '/logo.jpeg';

export default function Navbar() {
    const pathname = usePathname();
    const { authState, logout } = useAuth();

    // Define navigation items based on user type
    const getNavItems = () => {
        if (!authState.isAuthenticated) {
            return [
                { label: 'Home', href: '/' },
                { label: 'View Complaints', href: '/complaints' },
                { label: 'About', href: '/about' },
                { label: 'Login', href: '/login' }
            ];
        }

        if (authState.userType === 'public') {
            return [
                { label: 'Home', href: '/' },
                { label: 'View Complaints', href: '/complaints' },
                { label: 'My Complaints', href: '/my-complaints' },
                { label: 'Post Complaint', href: '/post-complaint' },
                { label: 'About', href: '/about' }
            ];
        }

        if (authState.userType === 'manager') {
            return [
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/manager/dashboard' },
                { label: 'View Ward Complaints', href: '/manager/complaints' },
                { label: 'All Complaints', href: '/complaints' }
            ];
        }

        if (authState.userType === 'supervisor') {
            return [
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/supervisor/dashboard' },
                { label: 'Ward Complaints', href: '/supervisor/complaints' },
                { label: 'All Complaints', href: '/complaints' },
                { label: 'Submissions', href: '/supervisor/submissions' }
            ];
        }

        return [];
    };

    const navItems = getNavItems();

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex h-16 items-center justify-between">

                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src={LOGO_PATH}
                                alt="CivicLens Logo"
                                width={80}
                                height={80}
                                className="object-contain h-12 w-auto"
                            />
                            <span className="text-2xl font-semibold text-green-950 tracking-tight">
                                CivicLens
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                            ? 'bg-green-900 text-white'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {authState.isAuthenticated && (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-300">
                                <span className="text-base text-slate-700 flex items-center gap-2">
                                    <span className="text-lg">👤</span>
                                    <span className="font-medium">{authState.username}</span>
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
