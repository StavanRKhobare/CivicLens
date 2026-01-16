import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-green-50 via-teal-50 to-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4">About CivicLens</h3>
                        <p className="text-sm text-slate-600">
                            A transparent platform for civic engagement and complaint management in Bangalore.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-green-900 transition text-slate-700">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/complaints" className="hover:text-green-900 transition text-slate-700">
                                    View Complaints
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-green-900 transition text-slate-700">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-green-900 transition text-slate-700">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-green-900 transition text-slate-700">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-green-900 transition text-slate-700">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-green-900 transition text-slate-700">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4">Contact</h3>
                        <p className="text-sm text-slate-600">
                            For research inquiries and academic collaboration
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-8 pt-8 text-center">
                    <p className="text-sm text-slate-600">
                        © 2026 CivicLens.
                    </p>
                </div>
            </div>
        </footer>
    );
}
