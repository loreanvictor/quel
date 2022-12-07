import { noop } from './noop'
import { Listener, Producer, Cleanup, SourceLike } from './types'


export class Source<T> implements SourceLike<T> {
  subs: Listener<T>[] = []
  last: T | undefined = undefined
  cleanup: Cleanup | undefined

  constructor(
    readonly producer: Producer<T> = noop
  ) {
    const cl = producer(val => this.emit(val), cleanup => this.cleanup = cleanup)

    if (cl && typeof cl === 'function') {
      this.cleanup = cl
    }
  }

  protected emit(val: T) {
    this.last = val
    const cpy = this.subs.slice()
    for(let i = 0; i < cpy.length; i++) {
      cpy[i]!(val)
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
    if (this.cleanup) {
      this.cleanup()
    }

    this.subs.length = 0
  }
}
