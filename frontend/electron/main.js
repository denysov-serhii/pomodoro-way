const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const DEV_SERVER_URL = 'http://localhost:8081';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 375,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.setMenuBarVisibility(false);

  if (!app.isPackaged) {
    win.loadURL(DEV_SERVER_URL).catch(() => {
      win.loadFile(path.join(__dirname, 'dev-error.html')).catch(() => {
        win.webContents.loadURL(
          'data:text/html,<h2>Development server is not running.</h2><p>Start it with: <code>npm run web</code></p>'
        );
      });
    });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
