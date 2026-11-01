import React, { useState } from 'react';
import {
  Moon,
  Activity,
  Droplets,
  Apple,
  Brain,
  Monitor,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import { SliderField } from './SliderField';
import { RatingSelect } from './RatingSelect';
import { SelectField } from './SelectField';
import { ToggleSwitch } from './ToggleSwitch';
import { AssessmentFormData, AssessmentDetail } from '../../types';
import { createAssessment, updateAssessment } from '../../services/api';

interface AssessmentWizardProps {
  initialData?: AssessmentFormData;
  editingId?: number | null;
  onSuccess?: (assessment: AssessmentDetail) => void;
  onCancel?: () => void;
}

const DEFAULT_FORM_DATA: AssessmentFormData = {
  // 1. Sleep
  sleep_hours: 7.5,
  sleep_consistency: 4,
  sleep_quality: 4,
  wake_freshness: 4,

  // 2. Physical Activity
  exercise_minutes: 30,
  activity_frequency_days: 3,
  step_count: 6500,
  sitting_hours: 7.0,

  // 3. Hydration
  water_intake_liters: 2.5,
  hydration_habit: 'regular',

  // 4. Nutrition
  meals_regularity: 3,
  fruit_veg_servings: 3,
  junk_food_freq: 1,

  // 5. Mental Wellness
  stress_level: 4,
  mindfulness_minutes: 15,
  work_life_balance: 4,

  // 6. Digital Habits
  recreational_screen_hours: 2.5,
  work_screen_hours: 6.5,
  screen_break_frequency: 'hourly',
  screen_before_bed: false,

  // General Habits
  caffeine_cups: 2,
  smoking_status: 'never',
  alcohol_freq: 'none',
  notes: '',
};

const STEPS = [
  { id: 1, title: 'Sleep Health', icon: Moon, desc: 'Duration, consistency & quality' },
  { id: 2, title: 'Physical Activity', icon: Activity, desc: 'Duration, frequency & sitting' },
  { id: 3, title: 'Hydration', icon: Droplets, desc: 'Water intake & daily habits' },
  { id: 4, title: 'Nutrition', icon: Apple, desc: 'Meal regularity & whole foods' },
  { id: 5, title: 'Mental Wellness', icon: Brain, desc: 'Stress levels & work-life balance' },
  { id: 6, title: 'Digital Habits', icon: Monitor, desc: 'Screen time & ergonomics' },
  { id: 7, title: 'Review & Submit', icon: CheckCircle2, desc: 'Summary verification' },
];

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  initialData,
  editingId = null,
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AssessmentFormData>(initialData || DEFAULT_FORM_DATA);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<AssessmentDetail | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const updateField = <K extends keyof AssessmentFormData>(key: K, value: AssessmentFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(1);
    setShowCancelModal(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      let result: AssessmentDetail;
      if (editingId) {
        result = await updateAssessment(editingId, formData);
      } else {
        result = await createAssessment(formData);
      }

      setSuccessResult(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to submit lifestyle assessment.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  // If already submitted successfully, render success celebration card
  if (successResult) {
    const score = successResult.scores;
    const ml = successResult.ml_insights;

    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6 text-center border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {editingId ? 'Assessment Updated Successfully!' : 'Lifestyle Assessment Completed!'}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your metrics were evaluated by the Explainable Scoring Engine and Unsupervised ML Subsystem.
          </p>
        </div>

        {/* Score & Cluster Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">LifeSync Index (LWI)</span>
            <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">{score.composite_lwi} / 100</div>
            <span className={`inline-block px-2 py-0.5 mt-2 rounded text-xs font-semibold ${
              score.risk_tier === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
              score.risk_tier === 'Fair' ? 'bg-amber-500/20 text-amber-400' :
              score.risk_tier === 'Elevated Risk' ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {score.risk_tier}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Behavioral Archetype</span>
            <div className="text-base font-bold text-slate-200 mt-2">{ml.cluster_name}</div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ml.cluster_description}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Anomaly Status</span>
            <div className="mt-2">
              {ml.is_anomaly ? (
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
                  Acute Outlier Detected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  Normal Population Distribution
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">Score: {ml.anomaly_score.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSuccessResult(null);
              setFormData(DEFAULT_FORM_DATA);
              setCurrentStep(1);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-cyan-500/20"
          >
            Start Another Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Questionnaire Header & Progress Tracker */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 border border-cyan-800/80 text-cyan-300">
                Step {currentStep} of {STEPS.length}
              </span>
              {editingId && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950 border border-amber-800 text-amber-300">
                  Editing #{editingId}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-xs text-slate-400">{STEPS[currentStep - 1].desc}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Progress: {progressPercentage}%</span>
            <span>{STEPS[currentStep - 1].title}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicator Chips */}
        <div className="hidden sm:flex items-center justify-between gap-1 pt-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isActive = currentStep === s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                  isActive
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                    : isCompleted
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Submission Issue</p>
            <p className="text-rose-300/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP FORMS CONTAINER */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-6">
        
        {/* ================= STEP 1: SLEEP ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Moon className="w-5 h-5 text-cyan-400" />
                Category 1: Sleep Duration & Sleep Architecture
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sleep duration and consistency directly govern cognitive focus, neurological restoration, and stress hormones.
              </p>
            </div>

            <SliderField
              label="Average Daily Sleep Duration"
              sublabel="Hours of actual sleep per night (recommended: 7.0 – 9.0 hours)"
              min={3.0}
              max={12.0}
              step={0.5}
              unit="hours"
              value={formData.sleep_hours}
              onChange={(val) => updateField('sleep_hours', val)}
              badge={formData.sleep_hours >= 7 && formData.sleep_hours <= 9 ? 'Optimal' : 'Needs Optimization'}
            />

            <RatingSelect
              label="Sleep Schedule Consistency"
              sublabel="Do you go to sleep and wake up at roughly the same time every day?"
              value={formData.sleep_consistency}
              onChange={(val) => updateField('sleep_consistency', val)}
              options={[
                { value: 1, label: 'Very Erratic', icon: '🌀', description: 'Schedule varies by >3 hours daily' },
                { value: 2, label: 'Irregular', icon: '⏳', description: 'Varies on weekends/weekdays' },
                { value: 3, label: 'Moderate', icon: '⚖️', description: 'Fairly consistent most nights' },
                { value: 4, label: 'Consistent', icon: '⏰', description: 'Sleeps within a 45-min window' },
                { value: 5, label: 'Very Regular', icon: '🎯', description: 'Strict circadian consistency' },
              ]}
            />

            <RatingSelect
              label="Self-Reported Sleep Quality"
              sublabel="How deep and uninterrupted was your sleep overall?"
              value={formData.sleep_quality}
              onChange={(val) => updateField('sleep_quality', val)}
              options={[
                { value: 1, label: 'Very Poor', icon: '😫', description: 'Frequent awakenings, restlessness' },
                { value: 2, label: 'Poor', icon: '😕', description: 'Light sleep, difficulty settling' },
                { value: 3, label: 'Fair', icon: '😐', description: 'Average sleep depth' },
                { value: 4, label: 'Good', icon: '😊', description: 'Sound sleep with minimal disruption' },
                { value: 5, label: 'Excellent', icon: '😴', description: 'Deep, uninterrupted restoration' },
              ]}
            />

            <RatingSelect
              label="Wake-Up Freshness"
              sublabel="How energized and refreshed do you feel 15 minutes after getting out of bed?"
              value={formData.wake_freshness}
              onChange={(val) => updateField('wake_freshness', val)}
              options={[
                { value: 1, label: 'Exhausted', icon: '🧟', description: 'Severe morning grogginess' },
                { value: 2, label: 'Sluggish', icon: '🥱', description: 'Requires multiple stimulants' },
                { value: 3, label: 'Neutral', icon: '😐', description: 'Takes ~30 mins to wake fully' },
                { value: 4, label: 'Alert', icon: '⚡', description: 'Ready to tackle morning tasks' },
                { value: 5, label: 'Energized', icon: '🚀', description: 'Fully alert and refreshed' },
              ]}
            />
          </div>
        )}

        {/* ================= STEP 2: PHYSICAL ACTIVITY ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Category 2: Physical Activity & Sedentary Behavior
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Regular movement counters musculoskeletal strain, stimulates dopamine synthesis, and reduces cardiovascular risk.
              </p>
            </div>

            <SliderField
              label="Daily Physical Activity Duration"
              sublabel="Dedicated exercise, brisk walking, sports, or gym time per day"
              min={0}
              max={120}
              step={5}
              unit="mins"
              value={formData.exercise_minutes}
              onChange={(val) => updateField('exercise_minutes', val)}
              badge={formData.exercise_minutes >= 30 ? 'Target Achieved' : 'Sedentary Flag'}
            />

            <SliderField
              label="Weekly Activity Frequency"
              sublabel="Number of days per week you engage in at least 20 minutes of moderate activity"
              min={0}
              max={7}
              step={1}
              unit="days/wk"
              value={formData.activity_frequency_days}
              onChange={(val) => updateField('activity_frequency_days', val)}
            />

            <SliderField
              label="Sedentary Sitting Behavior"
              sublabel="Total hours spent sitting per day (study, lectures, desk work, transit)"
              min={1.0}
              max={16.0}
              step={0.5}
              unit="hours"
              value={formData.sitting_hours}
              onChange={(val) => updateField('sitting_hours', val)}
              badge={formData.sitting_hours > 8 ? 'High Sedentary Risk' : 'Acceptable'}
            />

            <SliderField
              label="Estimated Daily Step Count"
              sublabel="Walking volume captured via pedometer or smart device"
              min={1000}
              max={20000}
              step={500}
              unit="steps"
              value={formData.step_count}
              onChange={(val) => updateField('step_count', val)}
            />
          </div>
        )}

        {/* ================= STEP 3: HYDRATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                Category 3: Hydration Hygiene & Water Intake
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Proper cellular hydration sustains metabolic efficiency, thermoregulation, and mitigates afternoon cognitive fatigue.
              </p>
            </div>

            <SliderField
              label="Average Daily Water Intake"
              sublabel="Plain water, herbal infusions, and electrolyte fluids (recommended: 2.5L – 3.5L)"
              min={0.5}
              max={5.0}
              step={0.1}
              unit="liters"
              value={formData.water_intake_liters}
              onChange={(val) => updateField('water_intake_liters', val)}
              badge={formData.water_intake_liters >= 2.5 ? 'Hydrated' : 'Dehydration Risk'}
            />

            <SelectField
              label="Self-Reported Hydration Habit Pattern"
              sublabel="How do you typically manage and pace your daily water consumption?"
              value={formData.hydration_habit}
              onChange={(val) => updateField('hydration_habit', val)}
              options={[
                { value: 'regular', label: 'Proactive & Regular', sublabel: 'Keep bottle nearby and sip steadily' },
                { value: 'thirst_only', label: 'Thirst Cues Only', sublabel: 'Only drink when mouth feels noticeably dry' },
                { value: 'reminders_needed', label: 'Needs Reminders', sublabel: 'Frequently forget until end of day' },
              ]}
            />
          </div>
        )}

        {/* ================= STEP 4: NUTRITION ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Apple className="w-5 h-5 text-cyan-400" />
                Category 4: Nutritional Regularity & Dietary Balance
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Non-clinical lifestyle nutrition focuses on meal timing consistency and whole-food micronutrient diversity.
              </p>
            </div>

            <SelectField
              label="Daily Meal Regularity"
              sublabel="Do you eat meals at predictable, consistent times, or skip core meals?"
              value={formData.meals_regularity}
              onChange={(val) => updateField('meals_regularity', parseInt(val, 10))}
              options={[
                { value: 3, label: 'Consistent Schedule', sublabel: 'Regular meals at standard hours every day' },
                { value: 2, label: 'Somewhat Regular', sublabel: 'Occasional skipped breakfast or late dinners' },
                { value: 1, label: 'Irregular / Grazing', sublabel: 'Frequently skip meals or eat at random times' },
              ]}
            />

            <SliderField
              label="Daily Fruit & Vegetable Servings"
              sublabel="Fresh fruit, cooked greens, legumes, and salad bowls (1 serving = 1 cup/fist size)"
              min={0}
              max={10}
              step={1}
              unit="servings"
              value={formData.fruit_veg_servings}
              onChange={(val) => updateField('fruit_veg_servings', val)}
              badge={formData.fruit_veg_servings >= 4 ? 'Optimal Micronutrients' : 'Below WHO Guideline'}
            />

            <SelectField
              label="General Meal Balance & Processed Food Frequency"
              sublabel="How often do you consume fried fast food, packaged instant snacks, or sugary drinks?"
              value={formData.junk_food_freq}
              onChange={(val) => updateField('junk_food_freq', parseInt(val, 10))}
              options={[
                { value: 0, label: 'Rarely / Never', sublabel: '< 1 time per month' },
                { value: 1, label: '1 – 2 times per week', sublabel: 'Moderate casual balance' },
                { value: 2, label: '3 – 4 times per week', sublabel: 'Frequent convenience eating' },
                { value: 3, label: 'Daily', sublabel: 'Daily reliance on quick foods' },
                { value: 4, label: 'Multiple times daily', sublabel: 'Primary calorie intake source' },
              ]}
            />
          </div>
        )}

        {/* ================= STEP 5: MENTAL WELLNESS ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Category 5: Stress Management & Study/Work-Life Balance
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Self-reported mental wellbeing evaluates autonomic nervous system balance and proactive stress decompression.
              </p>
            </div>

            <SliderField
              label="Self-Reported Stress Level (1 - 10)"
              sublabel="1 = Completely relaxed & in control; 10 = Severe chronic overwhelm/burnout"
              min={1}
              max={10}
              step={1}
              unit="/10"
              value={formData.stress_level}
              onChange={(val) => updateField('stress_level', val)}
              badge={formData.stress_level >= 7 ? 'High Stress Alert' : 'Manageable'}
            />

            <SliderField
              label="Daily Relaxation & Mindfulness Frequency"
              sublabel="Dedicated time for breathwork, quiet contemplation, leisure reading, or meditation"
              min={0}
              max={60}
              step={5}
              unit="mins"
              value={formData.mindfulness_minutes}
              onChange={(val) => updateField('mindfulness_minutes', val)}
            />

            <RatingSelect
              label="Study / Work-Life Balance Rating"
              sublabel="Do your daily commitments leave adequate room for relationships, hobbies, and recovery?"
              value={formData.work_life_balance}
              onChange={(val) => updateField('work_life_balance', val)}
              options={[
                { value: 1, label: 'Poor', icon: '🌪️', description: 'Work entirely dominates daily life' },
                { value: 2, label: 'Strained', icon: '⚡', description: 'Frequent overtime / late nights' },
                { value: 3, label: 'Fair', icon: '⚖️', description: 'Reasonable balance with occasional crunch' },
                { value: 4, label: 'Good', icon: '🌿', description: 'Healthy personal boundaries' },
                { value: 5, label: 'Optimal', icon: '☀️', description: 'Harmonious integration & recovery' },
              ]}
            />
          </div>
        )}

        {/* ================= STEP 6: DIGITAL HABITS ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-cyan-400" />
                Category 6: Digital Hygiene, Screen Time & Ergonomics
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Excessive uninterrupted screen time strains optic nerves, degrades cervical spine posture, and delays sleep latency.
              </p>
            </div>

            <SliderField
              label="Recreational Screen Time"
              sublabel="Social media browsing, streaming shows, mobile gaming, and casual feeds"
              min={0.0}
              max={12.0}
              step={0.5}
              unit="hours"
              value={formData.recreational_screen_hours}
              onChange={(val) => updateField('recreational_screen_hours', val)}
            />

            <SliderField
              label="Work / Study Screen Time"
              sublabel="Laptop coding, documentation, online lectures, and terminal sessions"
              min={0.0}
              max={14.0}
              step={0.5}
              unit="hours"
              value={formData.work_screen_hours}
              onChange={(val) => updateField('work_screen_hours', val)}
            />

            <SelectField
              label="Screen Break Frequency & Ergonomic Habits"
              sublabel="How frequently do you consciously disengage eyes and posture from the screen?"
              value={formData.screen_break_frequency}
              onChange={(val) => updateField('screen_break_frequency', val)}
              options={[
                { value: 'every_30m', label: 'Every 30 Minutes', sublabel: '20-20-20 rule or quick stretch' },
                { value: 'hourly', label: 'Every 60 Minutes', sublabel: 'Hourly stand up break' },
                { value: 'rarely', label: 'Rarely / Multi-Hour Blocks', sublabel: '3+ hours of unbroken gazing' },
              ]}
            />

            <ToggleSwitch
              label="Night Screen Exposure (Within 1h of Sleep)"
              sublabel="Do you look at phone, tablet, or monitor screens in bed or during the hour before sleeping?"
              checked={formData.screen_before_bed}
              onChange={(checked) => updateField('screen_before_bed', checked)}
            />
          </div>
        )}

        {/* ================= STEP 7: REVIEW & SUBMIT ================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Verification: Review Your Lifestyle Metrics
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verify your inputs across all 6 lifestyle pillars before running the AI assessment and scoring models.
              </p>
            </div>

            {/* Summary Review Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Moon className="w-4 h-4" /> Sleep Health</span>
                  <button onClick={() => setCurrentStep(1)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Sleep Duration: <span className="font-mono font-semibold">{formData.sleep_hours}h</span></p>
                  <p>• Consistency Rating: <span className="font-mono font-semibold">{formData.sleep_consistency}/5</span></p>
                  <p>• Sleep Quality: <span className="font-mono font-semibold">{formData.sleep_quality}/5</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Physical Activity</span>
                  <button onClick={() => setCurrentStep(2)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Daily Exercise: <span className="font-mono font-semibold">{formData.exercise_minutes} mins</span></p>
                  <p>• Weekly Frequency: <span className="font-mono font-semibold">{formData.activity_frequency_days} days/wk</span></p>
                  <p>• Sedentary Sitting: <span className="font-mono font-semibold">{formData.sitting_hours}h</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4" /> Hydration</span>
                  <button onClick={() => setCurrentStep(3)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Daily Water: <span className="font-mono font-semibold">{formData.water_intake_liters}L</span></p>
                  <p>• Pattern: <span className="font-semibold capitalize">{formData.hydration_habit}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Apple className="w-4 h-4" /> Nutrition</span>
                  <button onClick={() => setCurrentStep(4)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Regularity: <span className="font-semibold">{formData.meals_regularity === 3 ? 'Consistent' : formData.meals_regularity === 2 ? 'Somewhat' : 'Irregular'}</span></p>
                  <p>• Produce Servings: <span className="font-mono font-semibold">{formData.fruit_veg_servings} / day</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Brain className="w-4 h-4" /> Mental Wellness</span>
                  <button onClick={() => setCurrentStep(5)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Self-Reported Stress: <span className="font-mono font-semibold">{formData.stress_level}/10</span></p>
                  <p>• Work-Life Balance: <span className="font-mono font-semibold">{formData.work_life_balance}/5</span></p>
                  <p>• Relaxation: <span className="font-mono font-semibold">{formData.mindfulness_minutes} mins</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4" /> Digital Hygiene</span>
                  <button onClick={() => setCurrentStep(6)} className="text-cyan-400 hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Total Screen: <span className="font-mono font-semibold">{(formData.recreational_screen_hours + formData.work_screen_hours).toFixed(1)}h</span></p>
                  <p>• Breaks: <span className="font-semibold capitalize">{formData.screen_break_frequency}</span></p>
                  <p>• Screen in Bed: <span className="font-semibold">{formData.screen_before_bed ? 'Yes' : 'No'}</span></p>
                </div>
              </div>
            </div>

            {/* Optional Personal Journal Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Personal Journal Notes (Optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                placeholder="e.g., Preparing for final semester project reviews this week..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>
        )}

        {/* ================= NAVIGATION CONTROLS ================= */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 text-sm font-extrabold transition-all shadow-xl shadow-cyan-500/30 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
                    Computing Scores & Clusters...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update & Recalculate' : 'Save & Analyze Lifestyle'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Cancel Assessment?</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel? Any unsaved edits will be reset to default values.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Continue Assessment
              </button>
              <button
                onClick={() => {
                  handleReset();
                  if (onCancel) onCancel();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40"
              >
                Discard & Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
