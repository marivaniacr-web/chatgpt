const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const APP_ID = 'br.com.cpfajuste.app';
const ALLOWED_SEARCH_HOST = 'www.google.com';

function createWindow() {
  const window = new BrowserWindow({
    width: 1180, height: 760, minWidth: 940, minHeight: 650,
    backgroundColor: '#f7f9fc',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.on('will-attach-webview', (event) => event.preventDefault());
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.setAppUserModelId(APP_ID);
if (!app.requestSingleInstanceLock()) app.quit();
app.whenReady().then(createWindow);
ipcMain.handle('open-public-name-search', async (_event, url) => {
  if (typeof url !== 'string' || url.length > 512) throw new TypeError('URL de pesquisa inválida');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== ALLOWED_SEARCH_HOST) throw new Error('URL não permitida');
  await shell.openExternal(parsed.toString());
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
