
export const validateCNJ = (cnj: string): boolean => {
  // Remove non-numeric characters
  const cleanCNJ = cnj.replace(/[^\d]/g, '');

  // Standard CNJ length is 20 digits
  if (cleanCNJ.length !== 20) return false;

  // Format: NNNNNNN-DD.AAAA.J.TR.OOOO
  // Structure:
  // N (7) - Sequential number
  // D (2) - Check digits
  // A (4) - Year
  // J (1) - Judiciary segment
  // T (2) - Court
  // O (4) - Origin unit

  const numSeq = cleanCNJ.substring(0, 7);
  const digitoVerificador = cleanCNJ.substring(7, 9);
  const ano = cleanCNJ.substring(9, 13);
  const justica = cleanCNJ.substring(13, 14);
  const tribunal = cleanCNJ.substring(14, 16);
  const origem = cleanCNJ.substring(16, 20);

  // Mod97 algorithm for CNJ validation
  const r1 = `${numSeq}${ano}${justica}${tribunal}${origem}00`;
  
  // JS numbers can't handle this size, need BigInt or string math
  // Implementation using BigInt (supported in modern browsers)
  try {
    const n = BigInt(r1);
    const remainder = Number(n % 97n);
    const check = 98 - remainder;
    
    return check === parseInt(digitoVerificador, 10);
  } catch (e) {
    // Fallback or error implies invalid format
    return false;
  }
};

export const formatCNJ = (value: string): string => {
  const v = value.replace(/\D/g, '').substring(0, 20);
  // Mask: 0000000-00.0000.0.00.0000
  return v
    .replace(/^(\d{7})(\d)/, '$1-$2')
    .replace(/^(\d{7}-\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2')
    .replace(/^(\d{7}-\d{2}\.\d{4}\.\d)(\d)/, '$1.$2')
    .replace(/^(\d{7}-\d{2}\.\d{4}\.\d\.\d{2})(\d)/, '$1.$2');
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE_MB = 20;
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não suportado. Use PDF ou Imagens.' };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Arquivo muito grande. Máximo de ${MAX_SIZE_MB}MB.` };
  }

  return { valid: true };
};
