// src/rules.js
import { COLUMNS, parseItalianNumber, formatItalianNumber, isAutovettura } from './utils';

export const step1_filterInfrannuali = (data) => {
  const initialCount = data.length;
  const newData = data.filter(row => {
    const ricorrenza = row[COLUMNS.RICORRENZA] || '';
    return !ricorrenza.toLowerCase().includes('infrannuale');
  });
  return { newData, log: `Step 1: Eliminate ${initialCount - newData.length} righe infrannuali` };
};

export const step2_removeDuplicates = (data) => {
  const beforeDuplicates = data.length;
  const uniqueData = [];
  const seen = new Set();
  data.forEach(row => {
    const key = JSON.stringify(row);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueData.push(row);
    }
  });
  return { newData: uniqueData, log: `Step 2: Rimosse ${beforeDuplicates - uniqueData.length} righe duplicate` };
};

export const step3_addNewColumns = (data, currentHeaders) => {
  const newHeadersCopy = [...currentHeaders];
  const bfIndex = newHeadersCopy.findIndex(h => h === COLUMNS.SCOSTAMENTO_PERCENTUALE);
  let newData = [...data]; // Lavora su una copia

  if (bfIndex !== -1) {
    // Inserisci solo se non già presenti per evitare duplicazioni in caso di ri-processamento (improbabile qui ma buona pratica)
    if (!newHeadersCopy.includes(COLUMNS.PREMIO_DESIDERATO)) {
        newHeadersCopy.splice(bfIndex + 1, 0, COLUMNS.PREMIO_DESIDERATO);
    }
    if (!newHeadersCopy.includes(COLUMNS.SCONTI_DA_FARE)) {
        // L'indice potrebbe essere cambiato se PREMIO_DESIDERATO è stato appena aggiunto
        const newBfIndex = newHeadersCopy.findIndex(h => h === COLUMNS.SCOSTAMENTO_PERCENTUALE);
        newHeadersCopy.splice(newBfIndex + 2, 0, COLUMNS.SCONTI_DA_FARE); 
    }
    
    newData = data.map(row => ({
      ...row,
      [COLUMNS.PREMIO_DESIDERATO]: row[COLUMNS.PREMIO_DESIDERATO] !== undefined ? row[COLUMNS.PREMIO_DESIDERATO] : '', // Mantieni valore se esiste
      [COLUMNS.SCONTI_DA_FARE]: row[COLUMNS.SCONTI_DA_FARE] !== undefined ? row[COLUMNS.SCONTI_DA_FARE] : ''
    }));
    return { newData, newHeaders: newHeadersCopy, log: `Step 3: Aggiunte/verificate colonne '${COLUMNS.PREMIO_DESIDERATO}' e '${COLUMNS.SCONTI_DA_FARE}'` };
  }
  return { newData, newHeaders: currentHeaders, log: `Step 3: Colonna '${COLUMNS.SCOSTAMENTO_PERCENTUALE}' non trovata, nessuna colonna aggiunta` };
};
  
export const step4_setPremioDesideratoLowScostamento = (data) => {
  let count = 0;
  const newData = data.map(row => {
    const newRow = { ...row }; // Lavora su una copia della riga
    const be = parseItalianNumber(newRow[COLUMNS.SCOSTAMENTO_VALORE]);
    const bc = parseItalianNumber(newRow[COLUMNS.LORDO_ATTUALE]);
    if (be <= 20) {
      newRow[COLUMNS.PREMIO_DESIDERATO] = formatItalianNumber(bc);
      count++;
    }
    return newRow;
  });
  return { newData, log: `Step 4: Impostato '${COLUMNS.PREMIO_DESIDERATO}' per ${count} righe (Scostamento <= 20)` };
};

export const step5_setTargaEffetto = (data) => {
  let count = 0;
  const newData = data.map(row => {
    const newRow = { ...row };
    const agenzia = newRow[COLUMNS.AGENZIA] || '';
    const be = parseItalianNumber(newRow[COLUMNS.SCOSTAMENTO_VALORE]);
    if (agenzia.includes('AXA ASSICURAZIONI') || be >= 150) {
      newRow[COLUMNS.TIPO_AZIONE] = 'TARGA EFFETTO';
      count++;
    }
    return newRow;
  });
  return { newData, log: `Step 5: Impostato '${COLUMNS.TIPO_AZIONE}' a 'TARGA EFFETTO' per ${count} righe` };
};

export const step6_distributeScontiCompagnie = (data) => {
  const companySconti = {
    'ALLIANZ NEXT S.P.A.': { total: 150, autovetture: 100, altri: 50 },
    'ITALIANA ASSICURAZIONI (AVE)': { total: 1000, autovetture: 800, altri: 200 },
    'HDI': { total: 500, autovetture: 400, altri: 100 },
    'HELVETIA': { total: 750, autovetture: 500, altri: 250 }
  };
  let modifiedCount = 0;
  const newData = data.map(r => ({...r})); // Crea una copia deep a livello di riga

  Object.entries(companySconti).forEach(([companyName, sconti]) => {
    const companyRowsIndices = newData
        .map((row, index) => ({ row, index }))
        .filter(({ row }) =>
            row[COLUMNS.TIPO_AZIONE] !== 'TARGA EFFETTO' &&
            row[COLUMNS.AGENZIA] &&
            row[COLUMNS.AGENZIA].includes(companyName)
        );

    const autovettureIndices = companyRowsIndices.filter(({row}) => isAutovettura(row[COLUMNS.USO]));
    const altriIndices = companyRowsIndices.filter(({row}) => !isAutovettura(row[COLUMNS.USO]));

    if (autovettureIndices.length > 0) {
      const scontoPerAuto = sconti.autovetture / autovettureIndices.length;
      autovettureIndices.forEach(({index}) => {
        const bc = parseItalianNumber(newData[index][COLUMNS.LORDO_ATTUALE]);
        const newValue = Math.max(0, bc - scontoPerAuto);
        newData[index][COLUMNS.PREMIO_DESIDERATO] = formatItalianNumber(newValue);
        newData[index][COLUMNS.SCONTI_DA_FARE] = formatItalianNumber(scontoPerAuto);
        modifiedCount++;
      });
    }

    if (altriIndices.length > 0) {
      const scontoPerAltro = sconti.altri / altriIndices.length;
      altriIndices.forEach(({index}) => {
        const bc = parseItalianNumber(newData[index][COLUMNS.LORDO_ATTUALE]);
        const newValue = Math.max(0, bc - scontoPerAltro);
        newData[index][COLUMNS.PREMIO_DESIDERATO] = formatItalianNumber(newValue);
        newData[index][COLUMNS.SCONTI_DA_FARE] = formatItalianNumber(scontoPerAltro);
        modifiedCount++;
      });
    }
  });
  return { newData, log: `Step 6: Applicati sconti per compagnie a ${modifiedCount} righe` };
};
  
export const step7_redistributeRossiDurante = (data) => {
  let count = 0;
  const newData = data.map(r => ({...r})); // Crea una copia deep a livello di riga

  const specialRowsIndices = newData
    .map((row, index) => ({ row, index }))
    .filter(({row}) => {
        const produttore = row[COLUMNS.GRUPPO_PRODUTTORE] || '';
        return produttore.includes('ROSSI TERESINA') || produttore.includes('DURANTE LUCA');
    });


  specialRowsIndices.forEach(({index}) => {
    const row = newData[index];
    const bd = parseItalianNumber(row[COLUMNS.LORDO_PRECEDENTE]);
    let currentPremioValue;

    // Usa il premio desiderato se già calcolato, altrimenti il lordo attuale
    if (row[COLUMNS.PREMIO_DESIDERATO] && String(row[COLUMNS.PREMIO_DESIDERATO]).trim() !== '') {
        currentPremioValue = parseItalianNumber(row[COLUMNS.PREMIO_DESIDERATO]);
    } else {
        currentPremioValue = parseItalianNumber(row[COLUMNS.LORDO_ATTUALE]);
    }
    const maxAllowed = bd + 15;
    
    if (currentPremioValue > maxAllowed) {
      row[COLUMNS.PREMIO_DESIDERATO] = formatItalianNumber(maxAllowed);
      const scontoOriginale = parseItalianNumber(row[COLUMNS.LORDO_ATTUALE]) - maxAllowed;
      row[COLUMNS.SCONTI_DA_FARE] = formatItalianNumber(Math.max(0, scontoOriginale));
      count++;
    }
  });
  return { newData, log: `Step 7: Redistribuzione per ROSSI/DURANTE applicata a ${count} righe eleggibili (su ${specialRowsIndices.length} totali per loro)` };
};