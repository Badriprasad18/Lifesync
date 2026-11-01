import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentWizard } from '../components/assessment/AssessmentWizard';
import { createAssessment, updateAssessment } from '../services/api';
import { AssessmentFormData, AssessmentDetail } from '../types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (res: AssessmentDetail) => {
    setSuccessMessage('Assessment completed and analyzed by ML engine!');
    sessionStorage.setItem('lifesync_latest_assessment', JSON.stringify(res));
    setTimeout(() => {
      navigate('/assessment/results');
    }, 600);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Comprehensive Lifestyle Assessment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete the 6 self-reflection pillars to receive your LifeSync Wellness Index, AI cluster archetype, and habit recommendations.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <span>Non-Medical Evaluation</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* The 6-Step Multi-Step Assessment Wizard */}
      <AssessmentWizard
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
