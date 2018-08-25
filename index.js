'use strict';
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const Menu = electron.Menu;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
process.preventClose = true;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
// Create the browser window.
mainWindow = new BrowserWindow({width: 1000, height: 800});
mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

// and load the index.html of the app.
mainWindow.loadURL('file://' + __dirname + '/index.html');

// Open the DevTools.
// mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('close', function(e) {
        console.log("CLOSE", process.preventClose);
        if (process.preventClose === true) {
            e.preventDefault();
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send('quit', 'main');
        }
    });

    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    var template = [
    {
        label: 'File',
        submenu: [
        { label: 'Open ...', accelerator: 'CmdOrCtrl+O', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('open', 'main');
        } },
        { label: 'Open ODD ...', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('openodd', 'main');
        } },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('save', 'main');
        } },
        { label: 'Save as ...', accelerator: 'Shift+CmdOrCtrl+S', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('saveas', 'main');
        } },
        ]
    },
    {
        label: 'Edit',
        submenu: [
        /*
        { label: 'Insert line', accelerator: 'F6', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('insert', 'main');
        } },
        { label: 'Delete line', accelerator: 'Shift+F6', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('delete', 'main');
        } },
        { type: 'separator' },
        */
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
        ]
    },
    {
        label: 'View',
        submenu: [
        { label: 'Toggle Full Screen', accelerator: (function() {
            if (process.platform == 'darwin')
                return 'Ctrl+Command+F';
            else
                return 'F11';
            })(),
            click: function(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
        },
        { label: 'Toggle Developer Tools', accelerator: (function() {
            if (process.platform == 'darwin')
                return 'Alt+Command+I';
            else
                return 'Ctrl+Shift+I';
            })(),
            click: function(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.toggleDevTools();
            }
        },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', click: function() { 
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send('quit', 'main');
        }},
        { label: 'Quit', accelerator: 'Alt+F4', click: function() { 
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send('quit', 'main');
        }},
        ]
    },
    { label: 'Help', role: 'help', submenu: [
        { label: 'Learn More',
          click: function() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send('help', 'main');
          }
        },
        ]
    },
    ];

    if (process.platform === 'darwin') {
        var name = require('electron').app.getName();
        template.unshift(
            { label: name,
            submenu: [
                { label: 'About ' + name, role: 'about' },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide ' + name, accelerator: 'Command+H', role: 'hide' },
                { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: function() { 
                    let window = BrowserWindow.getFocusedWindow();
                    window.webContents.send('quit', 'main');
                }},
            ]
        });
        // Window menu.
        template[4].submenu.push( { type: 'separator' } );
        template[4].submenu.push( { label: 'Bring All to Front', role: 'front' } );
    }
    var localmenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(localmenu);

});
