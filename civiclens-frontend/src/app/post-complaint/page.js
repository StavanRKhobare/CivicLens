'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, Info, Send, Upload, X } from 'lucide-react';

export default function PostComplaintPage() {
    const { authState } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        description: '',
        city: 'Bangalore'
    });

    const [images, setImages] = useState([]);
    const [charCount, setCharCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    // Protect route - only authenticated public users can access
    useEffect(() => {
        if (!authState.isAuthenticated) {
            router.push('/login');
        } else if (authState.userType !== 'public') {
            router.push('/');
        }
    }, [authState, router]);

    const handleDescriptionChange = (e) => {
        const text = e.target.value;
        setFormData({ ...formData, description: text });
        setCharCount(text.length);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            setError('You can only upload up to 3 images.');
            return;
        }

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    
                    let scaleSize = 1;
                    if (img.width > MAX_WIDTH) {
                        scaleSize = MAX_WIDTH / img.width;
                    }
                    
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setImages(prev => [...prev, dataUrl]);
                };
            };
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (formData.description.trim().length < 20) {
            setError('Please provide a more detailed description (at least 20 characters)');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    raw_text: formData.description.trim(),
                    submitted_by: authState.username,
                    images: images
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle backend validation errors
                throw new Error(data.error || 'Failed to submit complaint');
            }

            // Success
            const toast = (await import('react-hot-toast')).default;
            toast.success('Complaint submitted successfully! 🎉', {
                duration: 5000,
            });


            setIsSubmitting(false);

            // Reset form
            setFormData({ description: '', city: 'Bangalore' });
            setImages([]);
            setCharCount(0);

            setSubmitSuccess(true);
        } catch (err) {
            const toast = (await import('react-hot-toast')).default;
            const errorMessage = err.message || 'Failed to submit complaint. Please try again.';

            toast.error(errorMessage, {
                duration: 6000,
            });

            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ description: '', city: 'Bangalore' });
        setCharCount(0);
        setSubmitSuccess(false);
        setError('');
    };

    const handleViewComplaints = () => {
        router.push('/complaints');
    };

    // Don't render until auth check is complete
    if (!authState.isAuthenticated || authState.userType !== 'public') {
        return null;
    }

    if (submitSuccess) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
                <div className="max-w-3xl mx-auto px-6 py-12">
                    {/* Success Card */}
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>

                        <div className="p-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-700" />
                                </div>

                                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                                    Complaint Submitted Successfully
                                </h2>

                                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                                    Your complaint is now publicly visible and will be processed by the ward management system.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleViewComplaints}
                                        className="px-8 py-3 bg-green-900 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        View All Complaints
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-8 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Submit Another Complaint
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Submit a Civic Complaint
                    </h1>
                    <p className="text-lg text-slate-600 mb-3">
                        Report civic issues for public visibility and ward-level action.
                    </p>
                    <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                            All complaints are publicly visible for transparency. Your submission will be automatically categorized and assigned to the appropriate ward.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>

                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Complaint Description */}
                        <div className="mb-6">
                            <label className="block text-base font-semibold text-slate-900 mb-2">
                                Describe the issue <span className="text-red-600">*</span>
                            </label>
                            <p className="text-sm text-slate-600 mb-3">
                                Include location details (street name, landmarks), nature of the issue, and how long it has persisted.
                            </p>
                            <textarea
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                rows={10}
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none text-slate-900 placeholder:text-slate-400"
                                placeholder="Example: Broken streetlight on MG Road near City Hospital junction, Ward 123. The light has been non-functional for over a week, causing safety concerns for pedestrians and vehicles during night hours. The pole number is SL-456."
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-slate-500">
                                    Minimum 20 characters required
                                </p>
                                <p className={`text-xs font-medium ${charCount >= 20 ? 'text-green-600' : 'text-slate-500'}`}>
                                    {charCount} characters
                                </p>
                            </div>
                        </div>

                        {/* City */}
                        <div className="mb-8">
                            <label className="block text-base font-semibold text-slate-900 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                disabled
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Currently supporting Bangalore only
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-8">
                            <label className="block text-base font-semibold text-slate-900 mb-2">
                                Attach Images (Optional)
                            </label>
                            <p className="text-sm text-slate-600 mb-3">
                                Upload up to 3 images (will be compressed automatically).
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mb-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                
                                {images.length < 3 && (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-green-600 hover:bg-green-50 transition-colors">
                                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                        <span className="text-xs text-slate-500 font-medium">Add Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            className="hidden" 
                                            onChange={handleImageUpload} 
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-green-900 mb-2">What happens next?</h3>
                            <ul className="text-sm text-green-800 space-y-1">
                                <li>• Your complaint will be publicly visible immediately</li>
                                <li>• AI will extract location and categorize the issue</li>
                                <li>• Complaint will be assigned to the appropriate ward</li>
                                <li>• Ward manager will review and update status</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || charCount < 20}
                                className="px-8 py-3 bg-green-900 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Complaint
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                </div>
            </div>
        </main>
    );
}
