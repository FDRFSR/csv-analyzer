// --- START OF FILE App.jsx ---

import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Importa da utils.js e rules.js
import { COLUMNS } from './utils'; // COLUMNS è definito in utils.js
import * as Rules from './rules'; // Importa tutte le funzioni da rules.js

const CSVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Stili CSS (invariati)
  const styles = { /* ... STESSI STILI DI PRIMA ... */
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
      overflow: 'hidden',
      borderCollapse: 'collapse'
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
    },
    errorBox: { 
      backgroundColor: '#fee2e2', 
      color: '#b91c1c', 
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  // Funzione per caricare e parsare il file con PapaParse (invariata)
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);
    setError(null);
    setStep(1);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      transformHeader: header => header.replace(/"/g, '').trim(),
      complete: (results) => {
        if (results.errors.length) {
          const errorMessages = results.errors.map(e => `${e.message} (riga: ${e.row + 2})`).join("; ");
          console.error('Error parsing CSV with PapaParse:', results.errors);
          setError(`Errore nel parsing del CSV: ${errorMessages}`);
          setProcessing(false);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        
        const parsedData = results.data;
        const parsedHeaders = results.meta.fields || (parsedData.length > 0 ? Object.keys(parsedData[0]) : []);

        setHeaders(parsedHeaders);
        setOriginalData(parsedData);
        setStep(2);
        setProcessing(false);
      },
      error: (error) => {
        console.error('Errore nel caricamento del file:', error);
        setError(`Errore nel caricamento del file: ${error.message}`);
        setProcessing(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };
  
  // Funzione principale di processamento
  const processData = async () => {
    if (!originalData.length) return;
    
    setProcessing(true);
    setError(null);
    // Crea una deep copy per evitare mutazioni accidentali dei dati originali
    // e per assicurare che ogni regola operi su una copia fresca se necessario.
    let currentProcessedData = JSON.parse(JSON.stringify(originalData)); 
    let currentHeadersState = [...headers]; // Usa lo stato degli header per il primo step
    const transformationLog = [];

    try {
      let stepResult;

      // Applica le regole importate
      stepResult = Rules.step1_filterInfrannuali(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);

      stepResult = Rules.step2_removeDuplicates(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);

      stepResult = Rules.step3_addNewColumns(currentProcessedData, currentHeadersState);
      currentProcessedData = stepResult.newData;
      currentHeadersState = stepResult.newHeaders; // Aggiorna gli header locali
      transformationLog.push(stepResult.log);
      
      stepResult = Rules.step4_setPremioDesideratoLowScostamento(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);

      stepResult = Rules.step5_setTargaEffetto(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);
      
      stepResult = Rules.step6_distributeScontiCompagnie(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);
      
      stepResult = Rules.step7_redistributeRossiDurante(currentProcessedData);
      currentProcessedData = stepResult.newData;
      transformationLog.push(stepResult.log);

      setHeaders(currentHeadersState); // Aggiorna lo stato globale degli header
      setProcessedData(currentProcessedData);
      setResults({
        originalRows: originalData.length,
        processedRows: currentProcessedData.length,
        transformations: transformationLog
      });
      setStep(3);
      
    } catch (e) {
      console.error('Errore nel processamento:', e);
      setError(`Errore nel processamento: ${e.message}`);
    }
    
    setProcessing(false);
  };

  // Funzione per scaricare il file processato come Excel (invariata)
  const downloadProcessedFile = () => {
    if (!processedData.length || !results) {
        setError("Nessun dato processato da scaricare o risultati mancanti.");
        return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      const excelData = [
        headers, 
        ...processedData.map(row => 
          headers.map(header => row[header] === null || row[header] === undefined ? '' : row[header])
        )
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      const colWidths = headers.map(header => ({
        wch: Math.max(String(header).length, 15) 
      }));
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati Processati');
      
      const statsData = [
        ['Statistiche Processamento'],
        [''],
        ['Righe originali', results.originalRows],
        ['Righe processate', results.processedRows],
        ['Righe elaborate/eliminate', results.originalRows - results.processedRows],
        [''],
        ['Log Trasformazioni'],
        ...results.transformations.map(log => [log])
      ];
      
      const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
      statsWorksheet['!cols'] = [{wch: 30}, {wch: 15}]; 
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistiche');
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `output_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
      console.log(`File Excel generato: ${filename}`);
      
    } catch (e) {
      console.error('Errore nella generazione del file Excel:', e);
      setError(`Errore nella generazione del file Excel: ${e.message}`);
    }
  };

  const resetAll = () => {
    setStep(1);
    setFile(null);
    setOriginalData([]);
    setProcessedData([]);
    setHeaders([]);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // JSX (invariato, tranne per l'import di COLUMNS se usato direttamente nel JSX,
  // ma in questo caso non sembra essere necessario)
  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div>
          <h1 style={styles.title}>
            CSV/Excel Analyzer
          </h1>
          <p style={styles.subtitle}>
            Trasformatore automatico per dati assicurativi - Output Excel
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

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
                Seleziona il file CSV da processare (delimitato da ';', output: Excel .xlsx)
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

        {step === 2 && (
          <div style={styles.uploadArea}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <FileText size={48} color="#10b981" />
            </div>
            <h3 style={styles.uploadTitle}>
              File caricato con successo
            </h3>
            <p style={styles.uploadSubtitle}>
              {originalData.length} righe caricate con {headers.length} colonne.
            </p>
            <div style={styles.buttonGroup}>
                <button
                onClick={processData}
                disabled={processing || originalData.length === 0}
                style={{
                    ...styles.button('success'),
                    ...((processing || originalData.length === 0) ? styles.buttonDisabled : {})
                }}
                >
                {processing ? 'Processamento...' : 'Inizia Processamento'}
                </button>
                <button
                    onClick={resetAll}
                    style={styles.button('gray')}
                    disabled={processing}
                >
                    Annulla e Carica Nuovo File
                </button>
            </div>
          </div>
        )}

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
                disabled={processedData.length === 0}
              >
                <Download size={20} />
                Scarica Excel Processato
              </button>
              <button
                onClick={resetAll}
                style={styles.button('gray')}
              >
                Nuovo File
              </button>
            </div>

            {processedData.length > 0 && headers.length > 0 && (
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
                            {String(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} style={rowIndex % 2 === 0 ? {} : styles.tableRowEven}>
                          {headers.slice(0, 10).map((header, colIndex) => (
                            <td key={colIndex} style={styles.tableCell}>
                              {row[header] === null || row[header] === undefined ? '' : String(row[header])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={styles.previewNote}>
                  Mostrando le prime {Math.min(10, headers.length)} colonne di {headers.length} totali.
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

// --- END OF FILE App.jsx ---