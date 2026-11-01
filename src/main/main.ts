import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDatabase } from './database/db'
import { DepartmentRepository } from './database/department.repo'
import { DocumentTypeRepository } from './database/document-type.repo'
import { UrgencyLevelsRepository } from './database/urgency-levels.repo'
import { ConfidentialityLevelsRepo } from './database/confidentiality_levels.repo'
import { DeliveryMethodsRepo } from './database/delivery-methods.repo'
import { PeopleRepo } from './database/people.repo'
import { PartnersRepo } from './database/partners.repo'
import { IncomingDocumentsRepo } from './database/incoming-documents.repo'
import { OutgoingDocumentsRepo } from './database/outgoing-documents.repo'
import { DocumentAssignmentsRepo } from './database/document-assignments.repo'
import { RequirementRepo } from './database/requirement.repo'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize the database
  const db = initDatabase()
  if (!db) {
    console.error('Failed to initialize the database.')
    app.quit()
    return
  }
  // IPC Handler
  DepartmentRepository(db)
  DocumentTypeRepository(db)
  UrgencyLevelsRepository(db)
  ConfidentialityLevelsRepo(db)
  DeliveryMethodsRepo(db)
  PeopleRepo(db)
  PartnersRepo(db)
  IncomingDocumentsRepo(db)
  OutgoingDocumentsRepo(db)
  DocumentAssignmentsRepo(db)
  RequirementRepo(db)

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
