const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  openPublicNameSearch: (url) => ipcRenderer.invoke('open-public-name-search', url)
});
