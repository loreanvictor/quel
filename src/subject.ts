import { Source } from './source'


export class Subject<T> extends Source<T> {
  constructor() {
    super()
  }

  set(value: T) {
    this.emit(value)
  }
}
