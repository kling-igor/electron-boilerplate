import { app, remote, screen } from 'electron'
import jsonfile from 'jsonfile'
import path from 'path'
import dotProp from 'dot-prop'

const DEFAULT_WIDTH = 1024
const DEFAULT_HEIGHT = 768

export default class SettingsFile {
  state = {
    window: {
      x: 0,
      y: 0,
      width: 1024,
      height: 768,
      isMaximized: false,
      isFullScreen: false
    }
  }

  filePath

  constructor(configName) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (app || remote.app).getPath('userData')
    this.filePath = path.join(userDataPath, configName + '.json')
    try {
      const state = jsonfile.readFileSync(this.filePath)

      if (state === Object(state) && !Array.isArray(state)) {
        const {
          window: {
            x = 0,
            y = 0,
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            isMaximized = false,
            isFullScreen = false
          } = {}
        } = state

        this.state = {
          window: {
            x: Number.isInteger(x) ? x : 0,
            y: Number.isInteger(y) ? y : 0,
            width: Number.isInteger(width) ? width : DEFAULT_WIDTH,
            height: Number.isInteger(height) ? height : DEFAULT_HEIGHT,
            isMaximized: !!isMaximized,
            isFullScreen: !!isFullScreen
          }
        }
      }
    } catch (e) {
      this.state = {}
    }
  }

  save() {
    try {
      jsonfile.writeFileSync(this.filePath, this.state, { spaces: 2 })
    } catch (e) {
      console.error(e)
    }
  }

  set(key, value) {
    if (value == null && key === Object(key) && !Array.isArray(key)) {
      this.state = key
      this.save()
      return
    }

    dotProp.set(this.state, key, value)
    this.save()
  }

  get(key) {
    return dotProp.get(this.state, key)
  }

  delete(key) {
    if (key == null) return
    dotProp.delete(this.state, key)
  }

  has(key) {
    return dotProp.has(this.state, key)
  }
}
