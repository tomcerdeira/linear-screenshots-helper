import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, FileText, Zap, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { INPUT_CLASS } from '../utils/styles';

interface WelcomeViewProps {
  readonly onComplete: () => void;
}

const TOTAL_STEPS = 3;

const pageTransition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

function StepDots({ current, total }: { readonly current: number; readonly total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 16 : 6,
            height: 6,
            backgroundColor: i === current ? '#5e6ad2' : '#333338',
          }}
          transition={{ duration: 0.25 }}
        />
      ))}
    </div>
  );
}

function StepWelcome({ onNext }: { readonly onNext: () => void }) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={pageTransition}
      className="flex flex-col items-center justify-center h-full px-10 gap-6"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          variants={fadeUp}
          custom={0}
          className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-linear-brand to-[#4850b8] flex items-center justify-center shadow-xl shadow-linear-brand/25"
        >
          <svg width="38" height="38" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M640 832H64V640a128 128 0 1 0 0-256V192h576v160h64V192h256v192a128 128 0 1 0 0 256v192H704V672h-64v160zm0-416v192h64V416h-64z"/>
          </svg>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="text-center space-y-2.5">
          <h1 className="text-lg font-semibold text-content tracking-tight">
            Screenshots to <span className="text-linear-brand">Linear tickets</span>
          </h1>
          <p className="text-sm text-content-ghost leading-relaxed max-w-[340px]">
            Capture any region of your screen and turn it into a Linear issue — without leaving your flow.
          </p>
        </motion.div>

        <motion.button
          variants={fadeUp}
          custom={2}
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors"
        >
          Get started
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

const STEPS = [
  {
    icon: Camera,
    title: 'Capture',
    desc: 'Press the global shortcut to select any region of your screen.',
  },
  {
    icon: FileText,
    title: 'Describe',
    desc: 'Add a title, description, and metadata in the popup form.',
  },
  {
    icon: Zap,
    title: 'Create',
    desc: 'Your screenshot is attached and the issue lands in Linear instantly.',
  },
];

function StepHowItWorks({ onNext }: { readonly onNext: () => void }) {
  return (
    <motion.div
      key="howitworks"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={pageTransition}
      className="flex flex-col h-full px-10 py-8"
    >
      <motion.div initial="hidden" animate="visible" className="flex flex-col flex-1">
        <motion.div variants={fadeUp} custom={0} className="space-y-1 mb-6">
          <h2 className="text-base font-semibold text-content tracking-tight">How it works</h2>
          <p className="text-xs text-content-ghost">Three steps. That's it.</p>
        </motion.div>

        <div className="flex flex-col gap-4 flex-1">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              custom={i + 1}
              className="flex items-start gap-4 p-4 rounded-xl bg-surface-raised border border-border"
            >
              <div className="w-9 h-9 rounded-lg bg-linear-brand/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-linear-brand" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-sm font-medium text-content">{title}</p>
                <p className="text-xs text-content-ghost leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} custom={4} className="mt-6">
          <button
            type="button"
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function StepApiKey({ onComplete }: { readonly onComplete: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState<boolean | null>(null);
  const [maskedKey, setMaskedKey] = useState('');

  React.useEffect(() => {
    window.api.getApiKey().then((result) => {
      if (result.success && result.data) {
        setHasExistingKey(true);
        setMaskedKey(result.data);
      } else {
        setHasExistingKey(false);
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setError('');
    try {
      const result = await window.api.setApiKey(apiKey.trim());
      if (result.success) {
        await window.api.setOnboardingComplete(true);
        onComplete();
      } else {
        setError(result.error ?? 'Invalid API key');
      }
    } catch {
      setError('Failed to save API key');
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    await window.api.setOnboardingComplete(true);
    onComplete();
  }

  if (hasExistingKey === null) return null;

  return (
    <motion.div
      key="apikey"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={pageTransition}
      className="flex flex-col h-full px-10 py-8"
    >
      <motion.div initial="hidden" animate="visible" className="flex flex-col flex-1">
        {hasExistingKey ? (
          <>
            <motion.div variants={fadeUp} custom={0} className="space-y-1 mb-6">
              <h2 className="text-base font-semibold text-content tracking-tight">Already connected</h2>
              <p className="text-xs text-content-ghost leading-relaxed">
                Your Linear API key is configured and ready to go.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="flex items-center gap-2.5 p-4 rounded-xl bg-surface-raised border border-border mb-6"
            >
              <Check className="w-4 h-4 text-feedback-success shrink-0" />
              <span className="text-sm text-content">Connected</span>
              <span className="text-xs text-content-ghost font-mono truncate">{maskedKey}</span>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="mt-auto">
              <button
                type="button"
                onClick={async () => {
                  await window.api.setOnboardingComplete(true);
                  onComplete();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors"
              >
                Start using the app
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={fadeUp} custom={0} className="space-y-1 mb-6">
              <h2 className="text-base font-semibold text-content tracking-tight">Connect to Linear</h2>
              <p className="text-xs text-content-ghost leading-relaxed">
                Create a personal API key to get started.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <button
                type="button"
                onClick={() => window.api.openExternal('https://linear.app/settings/account/security')}
                className="flex items-center gap-2 mb-5 text-xs text-linear-brand hover:underline transition-colors"
              >
                Open Linear Settings
                <ExternalLink className="w-3 h-3" />
              </button>
            </motion.div>

            <motion.form
              variants={fadeUp}
              custom={2}
              onSubmit={handleSave}
              className="flex flex-col gap-3 flex-1"
            >
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="lin_api_..."
                className={INPUT_CLASS}
                autoFocus
              />

              {error && <p className="text-xs text-feedback-error">{error}</p>}

              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="w-full py-2.5 bg-linear-brand text-white rounded-full text-sm font-medium hover:bg-linear-brand-hover transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {saving ? 'Connecting...' : 'Connect'}
              </button>
            </motion.form>

            <motion.div variants={fadeUp} custom={3} className="mt-auto pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-center text-xs text-content-ghost hover:text-content transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function WelcomeView({ onComplete }: WelcomeViewProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
          {step === 1 && <StepHowItWorks onNext={() => setStep(2)} />}
          {step === 2 && <StepApiKey onComplete={onComplete} />}
        </AnimatePresence>
      </div>
      <div className="flex justify-center pb-5 shrink-0">
        <StepDots current={step} total={TOTAL_STEPS} />
      </div>
    </div>
  );
}
