import { join } from 'path'
import * as URL from 'url'
import { BrowserWindow } from 'electron'
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

    const { width = 1280, height = 800, backgroundColor } = options

    const window = new BrowserWindow({
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
}

export default new WindowManager()
