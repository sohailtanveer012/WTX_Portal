import React, { useState, useRef } from 'react';
import { X, Play, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import DashboardScreen from '../assets/Portal-Dashboard-Screen.png';
import InvestmentScreen from '../assets/Investment-Opportunities-Screen.png';
import ReadyToStartScreen from '../assets/Ready-To-Start-Screen.png';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

export function OnboardingModal({ isOpen, onClose, userProfile, setUserProfile }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    contact_name: userProfile?.contact_name || '',
    account_name: userProfile?.account_name || '',
    phone: userProfile?.phone || '',
    email: userProfile?.email || '',
    birthday: userProfile?.birthday || '',
    account_id: userProfile?.account_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  const steps = [
    {
      title: "Welcome to WTX Energy! 👋",
      description: "Welcome aboard! Let's take a quick tour of your new investment platform.",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      title: "Your Dashboard 📊",
      description: "Everything you need to track your investments in one place.",
      image: DashboardScreen,
      features: [
        "Real-time investment tracking",
        "Performance analytics",
        "Monthly distribution history",
        "Project updates and notifications"
      ]
    },
    {
      title: "Investment Opportunities 💎",
      description: "Find and invest in new oil & gas opportunities.",
      image: InvestmentScreen,
      features: [
        "Browse available projects",
        "Detailed project information",
        "Easy investment process",
        "Track funding progress"
      ]
    },
    {
      title: "Confirm Your Info",
      description: "Please review and confirm your information. You can update any field except your Account ID.",
      confirmProfile: true
    },
    {
      title: "Ready to Start! 🚀",
      description: "You're all set to begin your journey with WTX Energy.",
      image: ReadyToStartScreen,
      features: [
        "Access your dashboard",
        "Explore investment opportunities",
        "Review educational resources",
        "Contact our support team"
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl w-full max-w-4xl my-4 relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{steps[currentStep].title}</h2>
              <p className="text-gray-400">{steps[currentStep].description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4 sm:mb-6">
            {currentStep === 0 ? (
              <div className="aspect-video bg-black/20 rounded-xl overflow-hidden h-[30vh] sm:h-[35vh] lg:h-[40vh]">
                <iframe
                  src={steps[currentStep].video}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : steps[currentStep].confirmProfile ? (
              <form
                ref={formRef}
                id="onboarding-confirm-profile-form"
                className="space-y-6 max-w-2xl mx-auto"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setError('');
                  try {
                    // Update user in Supabase
                    const { error } = await import('../supabaseClient').then(({ supabase }) =>
                      supabase.from('users').update({
                        contact_name: formData.contact_name,
                        account_name: formData.account_name,
                        phone: formData.phone,
                        email: formData.email,
                        birthday: formData.birthday,
                      }).eq('id', userProfile.id)
                    );
                    if (error) {
                      setError(error.message);
                      setSaving(false);
                      return;
                    }
                    // Update parent state
                    setUserProfile({ ...userProfile, ...formData });
                    setSaving(false);
                    setCurrentStep(currentStep + 1);
                  } catch (err: any) {
                    setError(err.message || 'Failed to update profile.');
                    setSaving(false);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Contact Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.contact_name}
                      onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Account Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.account_name}
                      onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Birthday</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.birthday}
                      onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Account ID</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                      value={formData.account_id}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                {error && <div className="text-red-400 mt-4">{error}</div>}
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  {steps[currentStep].features?.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>
                {steps[currentStep].image && (
                  <div className="bg-black/20 rounded-xl overflow-hidden hidden lg:block h-[300px]">
                    <img
                      src={steps[currentStep].image}
                      alt={steps[currentStep].title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 sticky bottom-0 bg-card-gradient">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className={`flex items-center px-4 py-2 rounded-xl transition-colors ${
                currentStep === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>
            <div className="hidden sm:flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep === index
                      ? 'bg-blue-500 w-8'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            {steps[currentStep].confirmProfile ? (
              <button
                type="button"
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
                disabled={saving}
                onClick={() => {
                  if (formRef.current) {
                    formRef.current.requestSubmit();
                  }
                }}
              >
                {saving ? 'Saving...' : 'Confirm & Continue'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    onClose();
                  } else {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
              >
                {currentStep === steps.length - 1 ? (
                  <>Get Started</>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}