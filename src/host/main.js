import setupEvents from './setupEvents'
import { app } from 'electron'
import WM from './window-manager'
import { exists } from 'fs'

if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  process.exit(0)
}

const onFocus = hash => {
  const win = WM.getWindow(hash)
  win.webContents.send('window:focus', true)
}

const onBlur = hash => {
  const win = WM.getWindow(hash)
  win.webContents.send('window:focus', false)
}

app.on('ready', () => {
  const hash = WM.openWindow(
    'index.html',
    { backgroundColor: 'white' },
    () => {
      // const menuTemplate = createMenuTemplate(eventEmitter);
      // const menu = Menu.buildFromTemplate(menuTemplate);
      // Menu.setApplicationMenu(menu);
    },
    () => {
      onFocus(hash)
    },
    () => {
      onBlur(hash)
    },
    false // DEV_TOOLS
  )
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
