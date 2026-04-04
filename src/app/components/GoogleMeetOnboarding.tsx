import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Video, Calendar, Mic, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GoogleMeetOnboardingModal({ open, onClose }: Props) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [permissions, setPermissions] = useState({
    calendar: true,
    meet: true,
    recording: false,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const handleGoogleAuth = () => {
    // Simulate OAuth
    setTimeout(() => setStep(2), 800);
  };

  const handlePermissions = () => {
    setStep(3);
    setShowConfetti(true);
  };

  const handleFinish = () => {
    setStep(1);
    setShowConfetti(false);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleFinish}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden`}
        >
          {/* Close button */}
          <button
            onClick={handleFinish}
            className={`absolute top-4 right-4 p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s <= step
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${s < step ? 'bg-purple-500' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Connect Google Meet
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Auto-capture your meetings with AI-powered transcription and action item extraction.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </motion.button>
                <button
                  onClick={handleFinish}
                  className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} hover:underline`}
                >
                  Skip for now
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className={`text-xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Grant Permissions
                </h3>
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select which permissions to grant Meeting AI
                </p>

                <div className="space-y-3">
                  {[
                    { key: 'calendar' as const, label: 'Google Calendar', desc: 'Read your meeting schedule', icon: Calendar },
                    { key: 'meet' as const, label: 'Google Meet', desc: 'Join and record meetings', icon: Video },
                    { key: 'recording' as const, label: 'Recording Access', desc: 'Save meeting recordings', icon: Mic },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[perm.key]}
                        onChange={() => setPermissions(p => ({ ...p, [perm.key]: !p[perm.key] }))}
                        className="w-4 h-4 rounded accent-purple-600"
                      />
                      <perm.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{perm.label}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePermissions}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-4 py-4"
              >
                {/* Confetti-like particles */}
                {showConfetti && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][i % 6],
                          left: `${10 + Math.random() * 80}%`,
                          top: '-5%',
                        }}
                        animate={{
                          y: [0, 400 + Math.random() * 200],
                          x: [0, (Math.random() - 0.5) * 100],
                          rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1.5 + Math.random(),
                          delay: Math.random() * 0.5,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </div>
                )}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  You're all set!
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Google Meet is now connected. Your meetings will be automatically captured.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg"
                >
                  Get Started
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
