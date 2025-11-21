
import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { validateCNJ, formatCNJ } from '../utils/validation';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (cnj: string) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [cnj, setCnj] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCNJ(raw);
    setCnj(formatted);
    
    // Real-time validation (only if length matches)
    if (formatted.replace(/\D/g, '').length === 20) {
        if (validateCNJ(formatted)) {
            setIsValid(true);
            setError(null);
        } else {
            setIsValid(false);
            setError("CNJ inválido (Dígito verificador incorreto)");
        }
    } else {
        setIsValid(false);
        setError(null);
    }
  };

  const handleCreate = () => {
    if (!isValid) {
        setError("Por favor, informe um CNJ válido.");
        return;
    }
    onCreate(cnj);
    setCnj(''); 
    setIsValid(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            Novo Processo
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Número do Processo (CNJ)
            </label>
            <div className="relative">
                <input
                type="text"
                value={cnj}
                onChange={handleChange}
                placeholder="0000000-00.0000.8.13.0000"
                className={`w-full bg-slate-950 border rounded-md px-4 py-3 text-slate-200 focus:ring-2 outline-none font-mono pr-10 ${
                    error ? 'border-red-500 focus:ring-red-500' : 
                    isValid ? 'border-emerald-500 focus:ring-emerald-500' : 'border-slate-800 focus:ring-amber-500'
                }`}
                autoFocus
                maxLength={25}
                />
                <div className="absolute right-3 top-3.5">
                    {isValid && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {error && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
            </div>
            
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            
            <p className="text-xs text-slate-600 mt-2">
              Formato padrão 20 dígitos com validação Mod97.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!isValid}>
              Criar Processo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
