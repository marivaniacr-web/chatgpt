const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

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
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(createWindow);
ipcMain.handle('open-public-name-search', async (_event, url) => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.google.com') throw new Error('URL não permitida');
  await shell.openExternal(parsed.toString());
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
