const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let htmServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Carrega a aplicação React em desenvolvimento
  mainWindow.loadURL('http://localhost:5173');

  // Abre o DevTools em desenvolvimento (opcional)
  // mainWindow.webContents.openDevTools();
}

// Configura o servidor Express para servir arquivos estáticos da pasta 'analises_htm'
function startHtmServer() {
  if (htmServer) {
    console.log('Servidor HTM já está rodando');
    return;
  }

  const analisesPath = path.join(process.resourcesPath || process.cwd(), 'analises_htm');
  
  const htmApp = express();
  htmApp.use(express.static(analisesPath));

  htmServer = htmApp.listen(3333, () => {
    console.log('Servidor HTM rodando em http://localhost:3333');
    // Abre no navegador externo do Windows
    shell.openExternal('http://localhost:3333');
  });

  htmServer.on('error', (err) => {
    console.error('Erro ao iniciar servidor HTM:', err);
  });
}

app.whenReady().then(() => {
  createWindow();

  // Canal IPC para iniciar o servidor HTM
  ipcMain.on('start-htm-server', () => {
    startHtmServer();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Fecha o servidor Express quando a janela é fechada
    if (htmServer) {
      htmServer.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
