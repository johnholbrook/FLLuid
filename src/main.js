// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, dialog, webContents, globalShortcut} = require('electron')
const path = require('path')

// initialize the @electron/remote module
require("@electron/remote/main").initialize();

// start the server
var server = require("./server/server.js");
server.initSendToController(function(name, data){
  controllerWindow.webContents.send(name, data);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.controllerWindow = null;
global.displayWindow = null;
global.updateWindow = null;

//global to indicate whether the app is running on macs
var isMac = (process.platform == 'darwin');

const aboutWindow = require('about-window').default;
const join = require('path').join;
function openAboutWindow(){ 
  aboutWindow({
    icon_path: join(__dirname, "about", "timer.png"),
    package_json_dir: join(__dirname, ".."),
    bug_report_url: "https://github.com/johnholbrook/FLLuid/issues",
    copyright: `Copyright (c) 2019-${new Date().getFullYear()} John Holbrook. <br/> Distributed under the MIT License.`,
    homepage: "https://github.com/johnholbrook/flluid",
    css_path: join(__dirname, "about", "about_window.css"),
    description: "An easy-to-use display package for FIRST Lego League events run using FLLTournament.com.",
    bug_link_text: "Bug reports & feature requests",
    adjust_window_size: true,
    use_inner_html: true,
    product_name: "FLLuid"
  });
}

//define the menu code
let winMenuTemplate = [
  ...(isMac ? [{
    label: app.getName(),
    submenu: [
      {
        label: 'About FLLuid',
        click: openAboutWindow
      },
      {
        label: "Check for Updates",
        click: () => {checkForUpdates(true)}
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  //file menu (non-Mac only)
  ...(isMac ? [] : [{
    label: "File",
    submenu: [
      {
        label: "About FLLuid",
        click: openAboutWindow
      },
      {
        label: "Check for Updates",
        click: () => {checkForUpdates(true)}
      }
    ]
  }]),
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      //more macOS only stuff in the "Edit" menu
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: 'Actions',
    submenu: [
      {
        label: "Global keyboard shortcuts are disabled.",
        enabled: false,
        id: "globalShortcutDescriptor"
      },
      {
        label: "Enable...",
        click: toggleGlobalShortcuts,
        id: "globalShortcutToggleItem"
      },
      { type: "separator" },
      { 
        label: "Start Timer",
        click: server.start_timer,
        accelerator: "CommandOrControl+Alt+Shift+F13"
      },
      {
        label: "Pause Timer",
        click: server.pause_timer,
        accelerator: "CommandOrControl+Alt+Shift+F14"
      },
      { 
        label: "Reset Timer",
        click: server.reset_timer,
        accelerator: "CommandOrControl+Alt+Shift+F15"
      },
      { type: "separator" },
      { 
        label: "Previous Block",
        click: prev_block,
        accelerator: "CommandOrControl+Alt+Shift+F16"
      },
      { 
        label: "Next Block",
        click: next_block,
        accelerator: "CommandOrControl+Alt+Shift+F17"
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/johnholbrook/flluid')
        }
      }
    ]
  }
]

function createControllerWindow(){
  // Create the browser window.
  controllerWindow = new BrowserWindow({
    width: 850,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule:true
    }
  })

  // and load the index.html of the app.
  controllerWindow.loadFile('./src/controller/controller.html');
  controllerWindow.setMinimumSize(550, 400);
}

function createDisplayWindow(dark){
  displayWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration:true
    }
  })

  // and load the index.html of the app.
  displayWindow.loadURL(`http://localhost:355${dark ? "?dark=1" : ""}`)
}

ipcMain.on("launch-disp-window", (event, dark) => {
  if (displayWindow == null){
    createDisplayWindow(dark);

    displayWindow.on('closed', function () {
      displayWindow = null;
    });
  }
});

function checkForUpdates(manually_activated){
  var getJSON = require('./web_scraper/get_json.js');
  getJSON("https://api.github.com/repos/johnholbrook/flluid/releases/latest", function(latest_release){
    let latest_version = latest_release.tag_name;
    if (latest_version.charAt(0) == 'v') latest_version = latest_version.substr(1);
    let this_version = app.getVersion();
    // let this_version = "0.1";

    if (latest_version > this_version){
      // a newer version is available, alert the user
      updateWindow = new BrowserWindow({
        parent: controllerWindow, 
        modal: true, 
        width: 800, 
        height: 685, 
        webPreferences: {
          preload: path.join(__dirname, "update/update_preload.js"),
          enableRemoteModule: true
        }
      });
      
      updateWindow.loadFile('./src/update/update.html');

      updateWindow.on('closed', function(){
        updateWindow = null;
      })
    }
    else{
      if (manually_activated){
        dialog.showMessageBox(controllerWindow, {
          type: "info",
          buttons: ["OK"],
          title: "Check for Updates",
          message: "FLLuid is up to date."
        });
      }
    }
  });
}

function initialize() {
  checkForUpdates(false);

  createControllerWindow();

  const winMenu = Menu.buildFromTemplate(winMenuTemplate)
  Menu.setApplicationMenu(winMenu)

  // Emitted when the window is closed.
  controllerWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    controllerWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initialize)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (controllerWindow === null) createControllerWindow();
})

app.on('will-quit', () => {
  unRegisterGlobalShortcuts();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//distribute the set-timer-text message to appropriate windows
ipcMain.on("set-timer-text", function(event, arg){
  timer_current.label = arg;
});

ipcMain.on("set-start-button-text", function(event, arg){
  displayWindow.webContents.send("set-start-button-text", arg);
  timer_sp.label = arg;
});

// these two functions are called by the action menu items and global shortcuts
function next_block(){
  controllerWindow.webContents.send("next-match-block");
}
function prev_block(){
  controllerWindow.webContents.send("prev-match-block");
}

// helper functions to manage global shortcuts
function registerGlobalShortcut(accelerator, callback, name){
  let gs_tmp = globalShortcut.register(accelerator, callback);
  if (!gs_tmp) console.error(`Failed to register global shortcut ${accelerator} for ${name}`);
}

var global_shortcuts_enabled = false;
function registerAllGlobalShortcuts(){
  // Note the the globalShortcut module only detects keypresses when the app **does not** have focus.
  // So even though there are menu items that do the same things with the same accelerators, the actions
  // will still only be triggered once when the accelerator is activated, whether the app has focus or not.
  registerGlobalShortcut("CommandOrControl+Alt+Shift+F13", server.start_timer, "start timer");
  registerGlobalShortcut("CommandOrControl+Alt+Shift+F14", server.pause_timer, "pause timer");
  registerGlobalShortcut("CommandOrControl+Alt+Shift+F15", server.reset_timer, "reset timer");
  registerGlobalShortcut("CommandOrControl+Alt+Shift+F16", prev_block, "previous block");
  registerGlobalShortcut("CommandOrControl+Alt+Shift+F17", next_block, "next block");
  global_shortcuts_enabled = true;
}

function unRegisterGlobalShortcuts(){
  globalShortcut.unregisterAll();
  global_shortcuts_enabled = false;
}

function toggleGlobalShortcuts(){
  // console.log("Toggling global shortcuts")
  if (global_shortcuts_enabled){
    unRegisterGlobalShortcuts();
    winMenuTemplate[4].submenu[0].label = "Global keyboard shortcuts are disabled.";
    winMenuTemplate[4].submenu[1].label = "Enable";
  }
  else{
    registerAllGlobalShortcuts();
    winMenuTemplate[4].submenu[0].label = "Global keyboard shortcuts are enabled.";
    winMenuTemplate[4].submenu[1].label = "Disable";
  }
  const winMenu = Menu.buildFromTemplate(winMenuTemplate)
  Menu.setApplicationMenu(winMenu)
}