import { Listener, Source } from './source'


export class Signal extends Source<void> {
  onces: Listener<void>[] = []

  constructor() {
    super()
  }

  public send() {
    this.emit()
  }

  protected override emit(): void {
    super.emit()
    while (this.onces.length > 0) {
      this.onces.shift()!()
    }
  }

  public once(listener: Listener<void>) {
    this.onces.push(listener)
  }
}
