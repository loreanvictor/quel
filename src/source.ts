import { disposable } from './disposable'
import { noop } from './noop'
import { Listener, Producer, Cleanup, SourceLike } from './types'


export class Source<T> implements SourceLike<T> {
  subs: Listener<T>[] | undefined = undefined
  last: T | undefined = undefined
  cleanup: Cleanup | undefined
  _stops: Promise<void> | undefined
  _stopsResolve: (() => void) | undefined
  _stopped = false

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
    if (this.subs) {
      const cpy = this.subs.slice()
      for(let i = 0; i < cpy.length; i++) {
        cpy[i]!(val)
      }
    }
  }

  get(listener?: Listener<T>) {
    if (listener) {
      this.subs ??= []
      this.subs.push(listener)
    }

    return this.last
  }

  subscribe(listener: Listener<T>) {
    //
    // can this be further optimised?
    //
    this.get(listener)

    return disposable(() => this.remove(listener))
  }

  remove(listener: Listener<T>) {
    if (this.subs) {
      const i = this.subs.indexOf(listener)
      if (i !== -1) {
        this.subs.splice(i, 1)
      }
    }
  }

  stop() {
    if (this.cleanup) {
      this.cleanup()
    }

    if (this.subs) {
      this.subs.length = 0
    }

    this._stopped = true

    if (this._stops) {
      this._stopsResolve!()
    }
  }

  stops() {
    this._stops ??= new Promise(resolve => this._stopsResolve = resolve)

    return this._stops
  }

  get stopped() {
    return this._stopped
  }

  [Symbol.dispose]() {
    this.stop()
  }
}
