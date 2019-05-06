import React from 'react'
import { render } from 'react-dom'
import App from './app'
import { Provider } from 'mobx-react'

import rootStore from './rootstore'

render(
  <Provider store={rootStore}>
    <App />
  </Provider>,
  document.getElementById('app')
)
