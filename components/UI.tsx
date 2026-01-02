import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { COLORS } from '../constants';
import { LucideChevronLeft, LucideX } from 'lucide-react';

// --- TYPOGRAPHY ---
export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`text-3xl font-extrabold tracking-tight mb-2 text-white ${className}`}>{children}</h1>
);

export const SubHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold text-[#B3B3C6] mb-4 ${className}`}>{children}</h2>
);

// --- CONTAINERS ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <motion.div
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={`bg-[#1A1A22] rounded-[24px] p-6 w-full ${className}`}
  >
    {children}
  </motion.div>
);

export const ScreenContainer: React.FC<{ children: React.ReactNode; onBack?: () => void }> = ({ children, onBack }) => (
  <div className="relative w-full h-[100dvh] max-w-[430px] mx-auto flex flex-col p-5 z-10 overflow-hidden bg-[#0F0F14] text-white">
    {onBack && (
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={onBack}
          className="p-2 rounded-full text-[#B3B3C6] hover:bg-white/5 active:scale-90 transition-all"
        >
          <LucideChevronLeft size={32} />
        </button>
      </div>
    )}
    {children}
  </div>
);

// --- BUTTONS ---
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = true, className = '', ...props }) => {
  const baseStyle = "min-h-[56px] px-6 rounded-[20px] font-bold text-lg transition-transform active:scale-95 flex items-center justify-center gap-2";
  
  // Strict Color Palette variants
  const variants = {
    primary: "bg-[#7C5CFF] text-white hover:bg-[#6c4ef0]", // Electric Purple
    secondary: "bg-transparent border-2 border-[#7C5CFF] text-white", 
    danger: "bg-[#E5484D] text-white", // Soft Crimson
    ghost: "bg-transparent text-[#B3B3C6] hover:text-white"
  };

  return (
    <motion.button
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// --- INPUTS ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full bg-[#1A1A22] text-white placeholder-[#B3B3C6] text-xl font-semibold py-4 px-6 rounded-[20px] outline-none border border-transparent focus:border-[#7C5CFF] transition-all"
  />
);

// --- MODALS ---
export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1A22] p-6 rounded-[24px] w-full max-w-xs z-10 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-[#B3B3C6] mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onCancel} className="flex-1 !min-h-[48px]">Cancel</Button>
              <Button variant="danger" onClick={onConfirm} className="flex-1 !min-h-[48px]">Leave</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const InfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1A1A22] p-6 rounded-t-[24px] sm:rounded-[24px] w-full max-w-[430px] z-10 border-t border-white/10 sm:border"
          >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">How to Play</h3>
                <button onClick={onClose} className="p-1 rounded-full bg-white/5 text-[#B3B3C6]"><LucideX size={20}/></button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar mb-6">
                <div>
                    <h4 className="text-[#7C5CFF] font-bold text-sm uppercase tracking-wider mb-2">Number Justify</h4>
                    <p className="text-[#B3B3C6] text-sm leading-relaxed">
                        Everyone gets a question and answers with a number. One player gets a slightly different question.
                        Reveal numbers, discuss, and vote out the impostor.
                    </p>
                </div>
                <div>
                    <h4 className="text-[#4CC9F0] font-bold text-sm uppercase tracking-wider mb-2">Impostor Word</h4>
                    <p className="text-[#B3B3C6] text-sm leading-relaxed">
                        The majority gets one word. The impostors get a different but related word.
                        No one knows who is who. Describe your word carefully to find the odd ones out.
                    </p>
                </div>
            </div>

            <Button onClick={onClose}>Got it</Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};