import { Listener, SourceLike, Observable, ExprFn, SKIP, STOP, ExprResultSync } from './types'
import { Source } from './source'


function normalize<T>(fn: Observable<T>): SourceLike<T> {
  if (typeof fn === 'function') {
    (fn as any).__observed__ ??= observe(fn)

    return (fn as any).__observed__
  } else {
    return fn
  }
}


export class Observation<T> extends Source<T> {
  tracked: Map<SourceLike<any>, Listener<any>> = new Map()
  cleanCandidate: SourceLike<any> | undefined
  syncToken = 0

  constructor(
    readonly fn: ExprFn<T>,
    readonly abort?: Listener<void>,
  ) {
    super(() => () => {
      this.tracked.forEach((h, t) => t.remove(h))
      this.tracked.clear()
    })

    this.run()
  }

  protected clean() {
    if (this.cleanCandidate) {
      const handler = this.tracked.get(this.cleanCandidate)!
      this.cleanCandidate.remove(handler)
      this.tracked.delete(this.cleanCandidate)
      this.cleanCandidate = undefined

      return false
    } else {
      return true
    }
  }

  protected nextToken() {
    // eslint-disable-next-line no-unused-expressions
    this.syncToken > 0 && this.abort && this.abort()

    /* istanbul ignore next */
    return ++this.syncToken > 10e12 ? this.syncToken = 1 : this.syncToken
  }

  protected run(src?: SourceLike<any>) {
    this.cleanCandidate = src
    const syncToken = this.nextToken()

    const _res = this.fn(obs => obs ? this.track(normalize(obs), syncToken) : undefined)

    if (_res instanceof Promise) {
      _res.then(res => {
        if (this.syncToken !== syncToken) {
          return
        }

        this.emit(res)
      })
    } else {
      this.emit(_res)
    }
  }

  protected override emit(res: ExprResultSync<T>) {
    if (this.clean() && res !== SKIP && res !== STOP) {
      super.emit(res)
    } else if (res === STOP) {
      this.stop()
    }
  }

  protected track<U>(src: SourceLike<U>, syncToken: number) {
    if (syncToken !== this.syncToken) {
      return undefined
    }

    if (this.cleanCandidate === src) {
      this.cleanCandidate = undefined
    }

    if (!this.tracked.has(src)) {
      const handler = () => this.run(src)
      this.tracked.set(src, handler)

      return src.get(handler)
    } else {
      return src.get()
    }
  }
}


export function observe<T>(fn: ExprFn<T>, abort?: Listener<void>) {
  return new Observation(fn, abort)
}
