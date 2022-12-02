import { Source } from './source'


export class Signal extends Source<void> {
  constructor() {
    super()
  }

  public send() {
    super.emit()
  }
}
