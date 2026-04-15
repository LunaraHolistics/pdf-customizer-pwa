const { contextBridge, ipcRenderer } = require('electron');

// Expõe funções seguras para o renderer (React)
contextBridge.exposeInMainWorld('electron', {
  openHtmServer: () => {
    ipcRenderer.send('start-htm-server');
  },
});
