export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        About CivicLens
                    </h1>
                    <p className="text-lg text-slate-600">
                        Transparent Civic Engagement Platform for Bangalore
                    </p>
                </div>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                        Introduction
                    </h2>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 mb-4">
                            CivicLens is a research-oriented platform designed to facilitate transparent civic engagement
                            between citizens and government authorities in Bangalore. The system enables citizens to submit
                            complaints about civic issues while providing government officials with tools to manage and
                            resolve these complaints efficiently.
                        </p>
                        <p className="text-slate-700">
                            Built with modern web technologies, CivicLens demonstrates how digital platforms can enhance
                            accountability and streamline communication between citizens and their local government.
                        </p>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                        System Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative bg-blue-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>
                            <div className="p-6">
                                <div className="text-3xl mb-3">👥</div>
                                <h3 className="font-semibold text-slate-900 mb-2">Public Users</h3>
                                <p className="text-sm text-slate-700">
                                    Citizens can view all complaints and submit their own civic issues after logging in.
                                </p>
                            </div>
                        </div>
                        <div className="relative bg-green-50 border border-green-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-600 to-green-700"></div>
                            <div className="p-6">
                                <div className="text-3xl mb-3">🏛️</div>
                                <h3 className="font-semibold text-slate-900 mb-2">Ward Managers</h3>
                                <p className="text-sm text-slate-700">
                                    Government officials manage complaints for their assigned wards with full CRUD capabilities.
                                </p>
                            </div>
                        </div>
                        <div className="relative bg-purple-50 border border-purple-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700"></div>
                            <div className="p-6">
                                <div className="text-3xl mb-3">👁️</div>
                                <h3 className="font-semibold text-slate-900 mb-2">Ward Supervisors</h3>
                                <p className="text-sm text-slate-700">
                                    Supervisory role with read-only access to complaints and verification capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                        Technical Orientation
                    </h2>
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                        <div className="p-8">
                            <h3 className="font-semibold text-slate-900 mb-4">Technology Stack</h3>
                            <ul className="space-y-2 text-slate-700">
                                <li><strong>Frontend:</strong> Next.js 16 with React</li>
                                <li><strong>Styling:</strong> Tailwind CSS</li>
                                <li><strong>Authentication:</strong> Context-based auth with role management</li>
                                <li><strong>Routing:</strong> Next.js App Router</li>
                            </ul>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                        Transparency & Accountability
                    </h2>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 mb-4">
                            CivicLens promotes transparency by making all complaints publicly visible. Citizens can track
                            the status of issues in their community, while government officials have clear accountability
                            for resolving complaints in their jurisdiction.
                        </p>
                        <p className="text-slate-700">
                            The platform includes analytics and reporting features to help identify trends and improve
                            civic service delivery over time.
                        </p>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                        Scope & Research Intent
                    </h2>
                    <div className="relative bg-amber-50 border border-amber-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700"></div>
                        <div className="p-8">
                            <p className="text-slate-700 mb-4">
                                <strong>Important:</strong> CivicLens is developed for research and academic purposes.
                                It serves as a demonstration of how modern web technologies can be applied to civic
                                engagement challenges.
                            </p>
                            <p className="text-slate-700">
                                The platform showcases role-based access control, ward-based complaint management,
                                and transparent civic processes in a simulated environment.
                            </p>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50"></div>
                    </div>
                </section>
            </div>
        </main>
    );
}
