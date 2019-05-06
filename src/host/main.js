import { app } from 'electron'
import WM from './window-manager'

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
