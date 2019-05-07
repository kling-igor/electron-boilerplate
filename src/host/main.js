import { app, screen } from 'electron'
import WM from './window-manager'
import { exists } from 'fs'
import * as _ from 'lodash'

import setupEvents from './setupEvents'
import SettingsFile from './settingsfile'

let config

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

const updateState = win => {
  if (!win) return
}

app.on('ready', () => {
  const displays = screen.getAllDisplays()

  displays.forEach(display => console.log(display.workArea))

  const hasExternalDisplay = displays.find(display => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  config = new SettingsFile('settings')
  // config.set('displayBounds', screen.getPrimaryDisplay().bounds)

  const windowBounds = config.get('window')

  if (!hasExternalDisplay && (windowBounds.x < 0 || windowBounds.y < 0)) {
    windowBounds.x = 0
    windowBounds.y = 0
  }

  const hash = WM.openWindow(
    'index.html',
    { backgroundColor: 'white', ...windowBounds },
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

  const updateWindowBounds = settings => {
    config.set('window', settings)
    // config.set('displayBounds', screen.getPrimaryDisplay().bounds)
  }

  let win = WM.getWindow(hash)

  screen.on('display-removed', (event, display) => {
    // если окно было в рамках отключенного дисплея
    if (WM.isWindowInBounds(win, display.bounds)) {
      // перемещаем окно в первый доступный дисплей
      const firstDisplay = screen.getAllDisplays()[0]
      if (firstDisplay) {
        const displayBounds = firstDisplay.bounds()
        win.move(displayBounds.x, displayBounds.y, true)
      }
    }
  })

  screen.on('display-metrics-changed', (event, display, changedMetrics) => {
    if (changedMetrics.includes('workArea') && WM.isWindowInBounds(win, display.bounds)) {
      const [winWidth, winHeight] = win.getSize()
      const { width, height } = display.workAreaSize()

      if (winWidth < width && winHeight < height) return

      const newWidth = winWidth > width ? width : winWidth
      const newHeight = winHeight > height ? height : winHeight

      win.setSize(newWidth, newHeight, true)
    }
  })

  const stateChangeHandler = () => {
    const bounds = WM.getWindowState(win)
    updateWindowBounds(bounds)
  }

  const throttledStateSave = _.throttle(stateChangeHandler, 500)

  const unsubscribeWinEvent = () => {
    win.removeListener('resize', throttledStateSave)
    win.removeListener('move', throttledStateSave)
    win.removeListener('close', throttledStateSave)
    win = null
  }

  win.on('resize', throttledStateSave)
  win.on('move', throttledStateSave)
  win.on('close', throttledStateSave)
  win.once('closed', unsubscribeWinEvent)

  win.once('maximize', () => {
    console.log('maximize')
  })
  win.once('unmaximize', () => {
    console.log('unmaximize')
  })
  win.once('minimize', () => {
    console.log('minimize')
  })
  win.once('restore', () => {
    console.log('restore')
  })
  win.once('enter-full-screen', () => {
    console.log('enter-full-screen')
  })
  win.once('leave-full-screen', () => {
    console.log('leave-full-screen')
  })
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})
