import React, { useState } from 'react';
import { useAuth } from '../App';
import {
  User, Lock, Bell, Shield, Save, Eye, EyeOff,
  CheckCircle, AlertCircle, Smartphone, Mail
} from 'lucide-react';
import IndiaPageHeader from '../components/IndiaPageHeader';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile fields (pre-populated from auth context)
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    organization: user?.organization ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
    ageGroup: user?.ageGroup ?? '',
    occupation: user?.occupation ?? '',
  });

  const [notifications, setNotifications] = useState({
    emailVerification: true,
    emailLeaderboard: true,
    emailCertificates: true,
    smsVerification: false,
    smsLeaderboard: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy' as const, label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  const ageGroups = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const occupations = ['Student', 'Salaried professional', 'Self-employed / entrepreneur', 'Government employee', 'Homemaker', 'NGO / non-profit', 'Retired', 'Other'];
  const states = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Other'];

  return (
    <div className="app-page-surface app-page-general min-h-screen py-8 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <IndiaPageHeader
          title={user?.name ?? 'Your i-Pledge Profile'}
          description="Keep your city, State or Union Territory and organisation details current so your contribution appears in the right Indian community rankings."
          imageSrc="/images/profile-neighbourhood.jpg"
          imageAlt="A participant updating their profile in an Indian neighbourhood"
          chips={[user?.role ?? 'Participant', user?.organization ?? 'Individual participant', profile.city || 'Add your city or town']}
          action={saved ? <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-800"><CheckCircle className="w-4 h-4" /> Changes saved</span> : undefined}
        />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === t.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      placeholder="+91 98765 43210"
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisation / Institution</label>
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={e => setProfile(p => ({ ...p, organization: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                    <select
                      value={profile.state}
                      onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                    >
                      <option value="">Select state</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Age Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Age Group <span className="text-red-500">*</span></label>
                    <select
                      value={profile.ageGroup}
                      onChange={e => setProfile(p => ({ ...p, ageGroup: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                    >
                      <option value="">Select age group</option>
                      {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                      <option value="Other">Prefer to self-describe</option>
                    </select>
                  </div>
                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupation <span className="text-red-500">*</span></label>
                    <select
                      value={profile.occupation}
                      onChange={e => setProfile(p => ({ ...p, occupation: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                    >
                      <option value="">Select occupation</option>
                      {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                  <div className="space-y-4">
                    {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors">
                      <Lock className="w-4 h-4" /> Update Password
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>
                  <p className="text-sm text-gray-500 mb-4">Add an extra layer of security using OTP on mobile or Microsoft Authenticator.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-brand-600 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-50 transition-colors">
                      <Smartphone className="w-4 h-4" /> Enable OTP (SMS)
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-azure-600 text-azure-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                      <Shield className="w-4 h-4" /> Link Microsoft Entra ID
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailVerification', icon: <Mail className="w-4 h-4" />, label: 'Email: Verification status updates', desc: 'Get notified when your activity reports are verified, rejected, or flagged.' },
                    { key: 'emailLeaderboard', icon: <Mail className="w-4 h-4" />, label: 'Email: Leaderboard rank changes', desc: 'Weekly digest of your rank on individual, org, and city leaderboards.' },
                    { key: 'emailCertificates', icon: <Mail className="w-4 h-4" />, label: 'Email: Certificate issued', desc: 'Get notified when a new certificate or badge is available to download.' },
                    { key: 'smsVerification', icon: <Smartphone className="w-4 h-4" />, label: 'SMS: Verification status updates', desc: 'SMS alerts for critical verification status changes.' },
                    { key: 'smsLeaderboard', icon: <Smartphone className="w-4 h-4" />, label: 'SMS: Monthly summary', desc: 'SMS summary of your monthly climate impact.' },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 mt-0.5">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-brand-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Data Privacy Notice</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Your data is processed in compliance with the <strong>GDPR (EU) 2016/679</strong> and the
                    <strong> India Digital Personal Data Protection Act 2023</strong>. Your personal information
                    is stored on Azure India (Central India region) and is used solely for i-Pledge campaign
                    analytics and certificate issuance.
                  </p>
                  <div className="space-y-2">
                    {[
                      'Your activity reports are visible to reviewers only.',
                      'Aggregated, anonymised data may be used for public campaign reports.',
                      'You can request a copy of your data at any time.',
                      'You can withdraw consent and request deletion of your data.',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Data Requests</h2>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-brand-600 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-50 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Request My Data Export
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-400 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                      <AlertCircle className="w-4 h-4" /> Request Account Deletion
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Requests are processed within 30 days per GDPR and India DPDP Act requirements.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
