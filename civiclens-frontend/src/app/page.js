export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                            AI-Enabled Intelligence for Transparent Civic Grievance Management
                        </div>
                        <h1 className="text-5xl font-bold text-slate-900 mb-6">
                            Ward-Level Complaint Intelligence with Role-Based Accountability
                        </h1>
                        <p className="text-xl text-slate-700 mb-8">
                            Unifies complaints across channels. Enforces ward-level workflow. Transparent tracking from submission to resolution.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="/complaints"
                                className="px-6 py-3 bg-green-900 text-white rounded-lg hover:bg-green-800 transition font-medium"
                            >
                                Explore Public Dashboard →
                            </a>
                            <a
                                href="/login"
                                className="px-6 py-3 border-2 border-green-900 text-green-900 rounded-lg hover:bg-green-50 transition font-medium"
                            >
                                Access System
                            </a>
                        </div>
                    </div>
                    <div className="rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                        <video
                            className="w-full h-auto"
                            controls
                            autoPlay
                            muted
                            loop
                        >
                            <source src="/home_vid.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                    For Citizens & Government
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                        <div className="p-8">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">
                                👥 For Citizens
                            </h3>
                            <ul className="space-y-2 text-slate-700">
                                <li>• View all public complaints</li>
                                <li>• Submit new complaints (after login)</li>
                                <li>• Track complaint status</li>
                                <li>• Transparent resolution process</li>
                            </ul>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                    </div>
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                        <div className="p-8">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">
                                🏛️ For Government
                            </h3>
                            <ul className="space-y-2 text-slate-700">
                                <li>• Ward-based complaint management</li>
                                <li>• Real-time analytics dashboard</li>
                                <li>• Efficient workflow for managers</li>
                                <li>• Supervisor oversight capabilities</li>
                            </ul>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="relative bg-gradient-to-r from-green-900 to-green-800 rounded-2xl p-12 text-center text-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20"></div>
                    <h2 className="text-3xl font-bold mb-4">
                        Transparency & Accountability
                    </h2>
                    <p className="text-lg mb-8 text-green-50">
                        Building trust through open civic engagement and data-driven governance
                    </p>
                </div>
            </section>
        </main>
    );
}
