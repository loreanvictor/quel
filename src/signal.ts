import { noop } from './noop'
import { Source } from './source'


export class Signal extends Source<void> {
  constructor() {
    super(noop)
  }

  public send() {
    super.emit()
  }
}
