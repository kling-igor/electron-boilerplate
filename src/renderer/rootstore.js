import { observable, action, computed, transaction, toJS, set } from 'mobx'

class Store {
  @observable value = ''

  @action.bound
  setValue(value) {
    this.value = value
  }
}

export default new Store()
