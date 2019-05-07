import { join } from 'path'
import * as URL from 'url'
import { BrowserWindow, screen } from 'electron'
const uuidv4 = require('uuid/v4')

class WindowManager {
  windows = {}

  /**
   *
   * @param {String} name - уникальное имя окна
   * @param {String} url  - имя html страницы
   * @param {Object} options - параметры конфигурации окна
   * @param {Function} onShowReady - callback на событие когда окно готово показаться
   * @param {Boolean} devTools - нужно ли показывать инструменты разработчика
   * @returns {String} - unique handler
   */
  openWindow(url, options = {}, onShowReady = f => f, onFocus = f => f, onBlur = f => f, devTools = false) {
    const hash = uuidv4().replace(/-/g, '')

    const { x = 0, y = 0, width = 1280, height = 800, backgroundColor } = options

    const window = new BrowserWindow({
      x,
      y,
      width,
      height,
      backgroundColor,
      show: false,
      icon: process.platform === 'linux' && join(__dirname, 'icons', 'icons', '64x64.png'),
      ...options
    })

    if (devTools) {
      window.webContents.openDevTools()
    }

    this.windows[hash] = window

    window.loadURL(
      URL.format({
        pathname: join(__dirname, url),
        protocol: 'file',
        slashes: true,
        hash
      })
    )

    window.once('ready-to-show', () => {
      window.show()
      onShowReady()
    })

    window.on('closed', () => {
      window.removeAllListeners()
      delete this.windows[hash]
    })

    window.on('blur', onBlur)

    window.on('focus', onFocus)

    return hash
  }

  get focusedWindow() {
    return BrowserWindow.getFocusedWindow()
  }

  getWindow(hash) {
    if (this.windows.hasOwnProperty(hash)) {
      return this.windows[hash]
    }
  }

  getWindowState(win) {
    if (!win) {
      return
    }

    try {
      const winBounds = win.getBounds()
      return {
        x: winBounds.x,
        y: winBounds.y,
        width: winBounds.width,
        height: winBounds.height,
        isMaximized: win.isMaximized(),
        isFullScreen: win.isFullScreen()
      }
    } catch (e) {
      console.error(e)
    }
  }

  isWindowVisible(win) {
    if (!win) {
      return false
    }

    return screen.getAllDisplays().some(display => this.isWindowInBounds(win, display.bounds))
  }

  isWindowInBounds(win, bounds) {
    if (!win) {
      return false
    }

    const winBounds = win.getBounds()
    return (
      winBounds.x >= bounds.x &&
      winBounds.y >= bounds.y &&
      winBounds.x + winBounds.width <= bounds.x + bounds.width &&
      winBounds.y + winBounds.height <= bounds.y + bounds.height
    )
  }
}

export default new WindowManager()
