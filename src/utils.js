// src/utils.js

export const COLUMNS = {
  RICORRENZA: 'Ricorrenza',
  SCOSTAMENTO_PERCENTUALE: '% Scostamento',
  SCOSTAMENTO_VALORE: 'Scostamento',
  LORDO_ATTUALE: 'Lordo Attuale',
  AGENZIA: 'Agenzia',
  TIPO_AZIONE: 'Tipo azione',
  USO: 'Uso',
  LORDO_PRECEDENTE: 'Lordo Precedente',
  GRUPPO_PRODUTTORE: 'Gruppo Produttore',
  PREMIO_DESIDERATO: 'premio desiderato',
  SCONTI_DA_FARE: 'sconti da fare',
};

export const parseItalianNumber = (value) => {
  if (value === null || value === undefined || typeof value === 'object') return 0;
  const stringValue = String(value).trim();
  if (stringValue === '') return 0;
  
  const cleanValue = stringValue.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatItalianNumber = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0,000';
  return Number(value).toFixed(3).replace('.', ',');
};

export const isAutovettura = (uso) => {
  if (!uso || typeof uso !== 'string') return false;
  const autovettureCodes = ['000', '001', '002'];
  return autovettureCodes.some(code => uso.includes(code));
};