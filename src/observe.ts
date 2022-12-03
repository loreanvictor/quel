import { Listener, Source } from './source'

export const SKIP = Symbol()

export type Track = <T>(obs: Observable<T>) => T | undefined
export type ExprFn<T> = (track: Track) => T | typeof SKIP
export type Observable<T> = Source<T> | ExprFn<T>


function normalize<T>(fn: Observable<T>): Source<T> {
  if (typeof fn === 'function') {
    (fn as any).__observed__ ??= observe(fn)

    return (fn as any).__observed__
  } else {
    return fn
  }
}


export class Observation<T> extends Source<T> {
  tracked: Map<Source<any>, Listener<any>> = new Map()
  cleanCandidate: Source<any> | undefined
  syncToken = 0

  constructor(
    readonly fn: ExprFn<T>
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
    return ++this.syncToken > 10e12 ? this.syncToken = 0 : this.syncToken
  }

  protected run(src?: Source<any>) {
    this.cleanCandidate = src
    const syncToken = this.nextToken()

    const _res = this.fn(obs => obs ? this.track(normalize(obs), syncToken) : undefined)

    if (_res instanceof Promise) {
      _res.then(res => {
        if (this.syncToken !== syncToken) {
          return
        }

        if (this.clean() && res !== SKIP) {
          this.emit(res)
        }
      })
    } else {
      const res = _res

      if (this.clean() && res !== SKIP) {
        this.emit(res)
      }
    }
  }

  protected track<U>(src: Source<U>, syncToken: number) {
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


export function observe<T>(fn: ExprFn<T>) {
  return new Observation(fn)
}
