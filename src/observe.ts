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
  track: Track
  syncToken = 0

  constructor(
    readonly fn: ExprFn<T>
  ) {
    super(() => () => {
      this.tracked.forEach((h, t) => t.remove(h))
      this.tracked.clear()
    })

    this.track = <U>(obs: Observable<U>) => {
      const ob$ = normalize(obs)

      if (this.cleanCandidate === ob$) {
        this.cleanCandidate = undefined
      }

      if (!this.tracked.has(ob$)) {
        const handler = () => this.run(ob$)
        this.tracked.set(ob$, handler)

        return ob$.get(handler)
      } else {
        return ob$.get()
      }
    }

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

  protected run(src?: Source<any>) {
    this.cleanCandidate = src
    const syncToken = ++this.syncToken

    const _res = this.fn(this.track)

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
}


export function observe<T>(fn: ExprFn<T>) {
  return new Observation(fn)
}
