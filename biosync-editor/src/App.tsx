import { useState } from 'react'
import './App.css'

declare global {
  interface Window {
    electron?: {
      openHtmServer: () => void;
    };
  }
}

function App() {
  const handleOpenHtmServer = () => {
    // Chama a função exposta pelo preload do Electron
    if (window.electron?.openHtmServer) {
      window.electron.openHtmServer();
    } else {
      console.log('Electron API não disponível (rodando no navegador)');
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>BioSync Editor</h1>
      <p>Editor de análises HTM com suporte a PDF</p>
      
      <button
        onClick={handleOpenHtmServer}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Abrir Servidor HTM
      </button>

      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Instruções</h2>
        <p>1. Clique no botão acima para iniciar o servidor HTM</p>
        <p>2. Coloque seus arquivos .htm na pasta "analises_htm"</p>
        <p>3. O servidor abrirá automaticamente no seu navegador padrão</p>
      </div>
    </div>
  )
}

export default App
