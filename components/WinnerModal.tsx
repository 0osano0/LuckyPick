import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Winner } from '../types';

interface WinnerModalProps {
  winner: Winner | null;
  onClose: () => void;
  isGeneratingMessage: boolean;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, isGeneratingMessage }) => {
  useEffect(() => {
    if (winner) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#ec4899', '#8b5cf6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#ec4899', '#8b5cf6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        
        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10 backdrop-blur-sm"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="relative pt-16 pb-16 px-8 flex flex-col items-center text-center mt-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-2xl mb-8 border-4 border-indigo-50 transform -translate-y-1/2 absolute top-0">
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-8">中奖的是</h2>
          
          {/* Massive Zoomed Display */}
          <div className="mb-10 w-full">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter break-words drop-shadow-sm leading-tight py-2">
              {winner.name}
            </h1>
          </div>

          <div className="w-full max-w-2xl bg-slate-50 rounded-2xl p-8 border border-slate-100 min-h-[120px] flex items-center justify-center">
            {isGeneratingMessage ? (
              <div className="flex items-center space-x-3 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium text-lg">正在生成 AI 祝福语...</span>
              </div>
            ) : (
              <p className="text-xl md:text-2xl font-medium text-slate-700 italic leading-relaxed">
                "{winner.aiMessage}"
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-12 px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
          >
            继续抽取
          </button>
        </div>
      </div>
    </div>
  );
};