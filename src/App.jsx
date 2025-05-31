import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const CSVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  // Stili CSS come oggetti JavaScript
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    mainCard: {
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
      textAlign: 'center'
    },
    subtitle: {
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '32px'
    },
    progressContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    progressSteps: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    progressStep: (isActive) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isActive ? '#3b82f6' : '#e5e7eb',
      color: isActive ? 'white' : '#6b7280',
      fontWeight: '500'
    }),
    progressLine: (isActive) => ({
      width: '64px',
      height: '4px',
      backgroundColor: isActive ? '#3b82f6' : '#e5e7eb'
    }),
    uploadArea: {
      textAlign: 'center'
    },
    uploadBox: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '48px',
      textAlign: 'center'
    },
    uploadTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#111827',
      margin: '16px 0 8px 0'
    },
    uploadSubtitle: {
      color: '#6b7280',
      marginBottom: '16px'
    },
    button: (variant = 'primary') => ({
      backgroundColor: variant === 'primary' ? '#3b82f6' : 
                      variant === 'success' ? '#10b981' : 
                      variant === 'gray' ? '#6b7280' : '#3b82f6',
      color: 'white',
      padding: '8px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }),
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    resultsCard: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    },
    resultsHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
      gap: '8px'
    },
    resultsTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#166534'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '6px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    logContainer: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '6px'
    },
    logTitle: {
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '8px'
    },
    logList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    logItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    logDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#10b981',
      borderRadius: '50%'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '32px'
    },
    table: {
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    tableHeader: {
      backgroundColor: '#f9fafb'
    },
    tableHeaderCell: {
      padding: '8px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      border: '1px solid #e5e7eb'
    },
    tableCell: {
      padding: '8px 16px',
      fontSize: '14px',
      color: '#111827',
      border: '1px solid #e5e7eb'
    },
    tableRowEven: {
      backgroundColor: '#f9fafb'
    },
    previewTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '16px'
    },
    previewNote: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '8px'
    }
  };

  // Funzione per convertire valori numerici italiani in float
  const parseItalianNumber = (value) => {
    if (!value || value === '') return 0;
    const cleanValue = value.toString().replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Funzione per formattare numeri in formato italiano
  const formatItalianNumber = (value) => {
    if (value === 0) return '0,000';
    return value.toFixed(3).replace('.', ',');
  };

  // Funzione per identificare se è un'autovettura
  const isAutovettura = (uso) => {
    if (!uso) return false;
    const autovettureCodes = ['000', '001', '002'];
    return autovettureCodes.some(code => uso.includes(code));
  };

  // Funzione per caricare e parsare il file
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);
    setStep(1);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headerLine = lines[0];
      const dataLines = lines.slice(1);
      
      // Parse headers
      const parsedHeaders = headerLine.split(';').map(h => h.replace(/"/g, '').trim());
      
      // Parse data
      const parsedData = dataLines.map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ';' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        const row = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setHeaders(parsedHeaders);
      setOriginalData(parsedData);
      setStep(2);
      
    } catch (error) {
      console.error('Errore nel parsing del file:', error);
      alert('Errore nel caricamento del file: ' + error.message);
    }
    
    setProcessing(false);
  };

  // Funzione principale di processamento
  const processData = async () => {
    if (!originalData.length) return;
    
    setProcessing(true);
    let currentData = [...originalData];
    const transformationLog = [];

    try {
      // STEP 1: Elimina righe infrannuali
      const initialCount = currentData.length;
      currentData = currentData.filter(row => {
        const ricorrenza = row['Ricorrenza'] || '';
        return !ricorrenza.toLowerCase().includes('infrannuale');
      });
      transformationLog.push(`Step 1: Eliminate ${initialCount - currentData.length} righe infrannuali`);

      // STEP 2: Rimuovi duplicati
      const beforeDuplicates = currentData.length;
      const uniqueData = [];
      const seen = new Set();
      
      currentData.forEach(row => {
        const key = JSON.stringify(row);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueData.push(row);
        }
      });
      currentData = uniqueData;
      transformationLog.push(`Step 2: Rimosse ${beforeDuplicates - currentData.length} righe duplicate`);

      // STEP 3: Aggiungi nuove colonne dopo BF
      const newHeaders = [...headers];
      const bfIndex = newHeaders.findIndex(h => h === '% Scostamento');
      if (bfIndex !== -1) {
        newHeaders.splice(bfIndex + 1, 0, 'premio desiderato', 'sconti da fare');
        currentData = currentData.map(row => ({
          ...row,
          'premio desiderato': '',
          'sconti da fare': ''
        }));
      }
      transformationLog.push(`Step 3: Aggiunte nuove colonne`);

      // STEP 4: Logica per BG (premio desiderato)
      let step4Count = 0;
      currentData = currentData.map(row => {
        const be = parseItalianNumber(row['Scostamento']);
        const bc = parseItalianNumber(row['Lordo Attuale']);
        
        if (be <= 20) {
          row['premio desiderato'] = formatItalianNumber(bc);
          step4Count++;
        }
        return row;
      });
      transformationLog.push(`Step 4: Impostato premio desiderato per ${step4Count} righe (BE <= 20)`);

      // STEP 5: Logica per colonna A (TARGA EFFETTO)
      let step5Count = 0;
      currentData = currentData.map(row => {
        const agenzia = row['Agenzia'] || '';
        const be = parseItalianNumber(row['Scostamento']);
        
        if (agenzia.includes('AXA ASSICURAZIONI') || be >= 150) {
          row['Tipo azione'] = 'TARGA EFFETTO';
          step5Count++;
        }
        return row;
      });
      transformationLog.push(`Step 5: Impostato TARGA EFFETTO per ${step5Count} righe`);

      // STEP 6: Distribuzione sconti per compagnie
      const companySconti = {
        'ALLIANZ NEXT S.P.A.': { total: 150, autovetture: 100, altri: 50 },
        'ITALIANA ASSICURAZIONI (AVE)': { total: 1000, autovetture: 800, altri: 200 },
        'HDI': { total: 500, autovetture: 400, altri: 100 },
        'HELVETIA': { total: 750, autovetture: 500, altri: 250 }
      };

      Object.entries(companySconti).forEach(([companyName, sconti]) => {
        const companyRows = currentData.filter(row => 
          row['Tipo azione'] !== 'TARGA EFFETTO' && 
          row['Agenzia'] && 
          row['Agenzia'].includes(companyName)
        );

        const autovetture = companyRows.filter(row => isAutovettura(row['Uso']));
        const altri = companyRows.filter(row => !isAutovettura(row['Uso']));

        if (autovetture.length > 0) {
          const scontoPerAuto = sconti.autovetture / autovetture.length;
          autovetture.forEach(row => {
            const bc = parseItalianNumber(row['Lordo Attuale']);
            const newValue = Math.max(0, bc - scontoPerAuto);
            row['premio desiderato'] = formatItalianNumber(newValue);
            row['sconti da fare'] = formatItalianNumber(scontoPerAuto);
          });
        }

        if (altri.length > 0) {
          const scontoPerAltro = sconti.altri / altri.length;
          altri.forEach(row => {
            const bc = parseItalianNumber(row['Lordo Attuale']);
            const newValue = Math.max(0, bc - scontoPerAltro);
            row['premio desiderato'] = formatItalianNumber(newValue);
            row['sconti da fare'] = formatItalianNumber(scontoPerAltro);
          });
        }
      });
      transformationLog.push(`Step 6: Applicati sconti per compagnie`);

      // STEP 7: Redistribuzione per ROSSI TERESINA e DURANTE LUCA
      const specialRows = currentData.filter(row => {
        const produttore = row['Gruppo Produttore'] || '';
        return produttore.includes('ROSSI TERESINA') || produttore.includes('DURANTE LUCA');
      });

      specialRows.forEach(row => {
        const bd = parseItalianNumber(row['Lordo Precedente']);
        const currentPremio = parseItalianNumber(row['premio desiderato']) || parseItalianNumber(row['Lordo Attuale']);
        const maxAllowed = bd + 15;
        
        if (currentPremio > maxAllowed) {
          row['premio desiderato'] = formatItalianNumber(maxAllowed);
          const sconto = parseItalianNumber(row['Lordo Attuale']) - maxAllowed;
          row['sconti da fare'] = formatItalianNumber(sconto);
        }
      });
      transformationLog.push(`Step 7: Redistribuzione per ${specialRows.length} righe speciali`);

      setHeaders(newHeaders);
      setProcessedData(currentData);
      setResults({
        originalRows: originalData.length,
        processedRows: currentData.length,
        transformations: transformationLog
      });
      setStep(3);
      
    } catch (error) {
      console.error('Errore nel processamento:', error);
      alert('Errore nel processamento: ' + error.message);
    }
    
    setProcessing(false);
  };

  // Funzione per scaricare il file processato
  const downloadProcessedFile = () => {
    if (!processedData.length) return;

    const csvHeaders = headers.join(';');
    const csvRows = processedData.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return `"${value}"`;
      }).join(';')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'output_processed.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div>
          <h1 style={styles.title}>
            CSV/Excel Analyzer
          </h1>
          <p style={styles.subtitle}>
            Trasformatore automatico per dati assicurativi
          </p>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          <div style={styles.progressSteps}>
            {[1, 2, 3].map((num) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.progressStep(step >= num)}>
                  {step > num ? <CheckCircle size={20} /> : num}
                </div>
                {num < 3 && <div style={styles.progressLine(step > num)} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={styles.uploadArea}>
            <div style={styles.uploadBox}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Upload size={48} color="#9ca3af" />
              </div>
              <h3 style={styles.uploadTitle}>
                Carica il file CSV
              </h3>
              <p style={styles.uploadSubtitle}>
                Seleziona il file CSV da processare
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                style={{
                  ...styles.button('primary'),
                  ...(processing ? styles.buttonDisabled : {})
                }}
              >
                {processing ? 'Caricamento...' : 'Seleziona File'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Process */}
        {step === 2 && (
          <div style={styles.uploadArea}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <FileText size={48} color="#10b981" />
            </div>
            <h3 style={styles.uploadTitle}>
              File caricato con successo
            </h3>
            <p style={styles.uploadSubtitle}>
              {originalData.length} righe caricate con {headers.length} colonne
            </p>
            <button
              onClick={processData}
              disabled={processing}
              style={{
                ...styles.button('success'),
                ...(processing ? styles.buttonDisabled : {})
              }}
            >
              {processing ? 'Processamento...' : 'Inizia Processamento'}
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <div>
            <div style={styles.resultsCard}>
              <div style={styles.resultsHeader}>
                <CheckCircle size={24} color="#10b981" />
                <h3 style={styles.resultsTitle}>
                  Processamento Completato
                </h3>
              </div>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Righe originali</p>
                  <p style={styles.statValue}>{results.originalRows}</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Righe processate</p>
                  <p style={styles.statValue}>{results.processedRows}</p>
                </div>
              </div>

              <div style={styles.logContainer}>
                <h4 style={styles.logTitle}>Log Trasformazioni:</h4>
                <ul style={styles.logList}>
                  {results.transformations.map((log, index) => (
                    <li key={index} style={styles.logItem}>
                      <span style={styles.logDot}></span>
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={downloadProcessedFile}
                style={styles.button('primary')}
              >
                <Download size={20} />
                Scarica CSV Processato
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setFile(null);
                  setOriginalData([]);
                  setProcessedData([]);
                  setResults(null);
                }}
                style={styles.button('gray')}
              >
                Nuovo File
              </button>
            </div>

            {/* Preview dei dati processati */}
            {processedData.length > 0 && (
              <div>
                <h4 style={styles.previewTitle}>
                  Preview Dati Processati (prime 5 righe)
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        {headers.slice(0, 10).map((header, index) => (
                          <th key={index} style={styles.tableHeaderCell}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} style={rowIndex % 2 === 0 ? {} : styles.tableRowEven}>
                          {headers.slice(0, 10).map((header, colIndex) => (
                            <td key={colIndex} style={styles.tableCell}>
                              {row[header] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={styles.previewNote}>
                  Mostrando le prime 10 colonne di {headers.length} totali
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return <CSVAnalyzer />;
}

export default App;