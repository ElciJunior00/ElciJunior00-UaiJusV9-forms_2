
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = 'bg-amber-500' }) => {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-xs mb-1 text-slate-400">
        <span>{label || 'Processando...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${color}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
