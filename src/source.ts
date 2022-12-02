import { noop } from './noop'

export type Listener<T> = (val: T) => void
export type Cleanup = () => void
export type Producer<T> = (listener: Listener<T>) => Cleanup | void


export class Source<T> {
  subs: Listener<T>[] = []
  last: T | undefined = undefined
  cleanup: Cleanup

  constructor(
    readonly producer: Producer<T> = noop
  ) {
    this.cleanup = producer(val => this.emit(val)) ?? noop
  }

  protected emit(val: T) {
    this.last = val
    for(let i = 0; i < this.subs.length; i++) {
      this.subs[i]!(val)
    }
  }

  get(listener?: Listener<T>) {
    if (listener && this.subs.indexOf(listener) === -1) {
      this.subs.push(listener)
    }

    return this.last
  }

  remove(listener: Listener<T>) {
    const i = this.subs.indexOf(listener)
    if (i !== -1) {
      this.subs.splice(i, 1)
    }
  }

  stop() {
    this.cleanup()
    this.subs.length = 0
  }
}
