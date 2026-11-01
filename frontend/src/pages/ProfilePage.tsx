import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Briefcase,
  Heart,
  Scale,
  Ruler,
  ShieldCheck,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.profile;

  const [fullName, setFullName] = useState(profile?.full_name || 'Aditya Sharma');
  const [age, setAge] = useState(profile?.age || 23);
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [occupation, setOccupation] = useState(profile?.occupation || 'MCA Student');
  const [heightCm, setHeightCm] = useState(profile?.height_cm || 176);
  const [weightKg, setWeightKg] = useState(profile?.weight_kg || 71.5);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '23.1';
  let bmiCategory = 'Normal Weight';
  let bmiColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  const numBmi = parseFloat(bmi);
  if (numBmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else if (numBmi >= 25 && numBmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else if (numBmi >= 30) {
    bmiCategory = 'High BMI';
    bmiColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification('Profile preferences updated successfully.');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
          <UserIcon className="w-3.5 h-3.5" />
          <span>User Identity</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          User Profile & Biometric Baselines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile information, baseline biometric markers, and academic demographic context.
        </p>
      </div>

      {savedNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* User Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-cyan-500/20">
          {fullName ? fullName[0] : 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || 'student_mca@college.edu'}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              {occupation}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              {age} years old
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 capitalize">
              {gender}
            </span>
          </div>
        </div>
      </div>

      {/* Biometric Calculated Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Ruler className="w-4 h-4 text-cyan-500" />
            <span>Height</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-2">
            {heightCm} <span className="text-xs font-normal text-slate-400">cm</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{(heightCm / 30.48).toFixed(1)} feet equivalent</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Scale className="w-4 h-4 text-teal-500" />
            <span>Weight</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-2">
            {weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{(weightKg * 2.205).toFixed(1)} lbs equivalent</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Heart className="w-4 h-4 text-violet-500" />
            <span>Body Mass Index (BMI)</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{bmi}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${bmiColor}`}>
              {bmiCategory}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standard WHO anthropometric range</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Occupation / Role
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
