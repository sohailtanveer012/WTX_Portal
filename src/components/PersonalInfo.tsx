import React from 'react';
import { User, Calendar, MapPin, Building, CreditCard, Eye, EyeOff, Mail, Phone, Edit } from 'lucide-react';

interface PersonalInfoProps {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  ssn?: string;
}

export function PersonalInfo({ name, email, phone, dob, address, company, ssn }: PersonalInfoProps) {
  const [showSSN, setShowSSN] = React.useState(false);

  // Format date of birth
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not provided';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Mask SSN
  const maskSSN = (ssnValue?: string) => {
    if (!ssnValue) return 'Not provided';
    if (showSSN) return ssnValue;
    // Format as XXX-XX-XXXX and mask
    const cleaned = ssnValue.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `XXX-XX-${cleaned.slice(-4)}`;
    }
    return 'XXX-XX-XXXX';
  };

  return (
    <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
      <div className="flex items-center space-x-3 mb-6">
        <User className="h-6 w-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {name && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <User className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Full Name</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {name}
            </p>
          </div>
        )}

        {email && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Email Address</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {email}
            </p>
          </div>
        )}

        {phone && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <Phone className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Phone Number</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {phone}
            </p>
          </div>
        )}

        {dob && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Date of Birth</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {formatDate(dob)}
            </p>
          </div>
        )}

        {address && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Address</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {address}
            </p>
          </div>
        )}

        {company && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Company</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {company}
            </p>
          </div>
        )}

        {ssn && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Social Security Number</label>
              </div>
              <button
                type="button"
                onClick={() => setShowSSN(!showSSN)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={showSSN ? "Hide SSN" : "Show SSN"}
              >
                {showSSN ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {maskSSN(ssn)}
            </p>
          </div>
        )}
      </div>

      {(!name && !email && !phone && !dob && !address && !company && !ssn) && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mt-4">
          <p className="text-yellow-400 text-sm text-center">
            No personal information on file. Please contact support to update your personal details.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            // Handle edit request - could show modal, contact support, etc.
            alert('Edit request submitted. Our team will contact you shortly to update your personal information.');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors font-medium"
        >
          <Edit className="h-5 w-5" />
          Request Edit
        </button>
      </div>
    </div>
  );
}

