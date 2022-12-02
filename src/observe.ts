import { Source } from './source'

export const SKIP = Symbol()

export type Track = <T>(obs: Observable<T>) => T | undefined
export type ExprFn<T> = (track: Track) => T | typeof SKIP
export type Observable<T> = Source<T> | ExprFn<T>


export function from<T>(fn: Observable<T>) {
  if (typeof fn === 'function') {
    (fn as any).__observed__ ??= observe(fn)

    return (fn as any).__observed__
  } else {
    return fn
  }
}


export class Observation<T> extends Source<T> {
  tracked: Source<unknown>[] = []
  visited: Source<unknown>[] = []
  handler: () => void
  track: Track
  syncToken: Symbol | undefined

  constructor(
    readonly fn: ExprFn<T>
  ) {
    super(() => () => {
      this.tracked.forEach(obs => obs.remove(this.handler))
      this.tracked.length = 0
      this.visited.length = 0
    })

    this.handler = () => this.run()
    this.track = <U>(obs: Observable<U>) => {
      const ob$ = from(obs)
      this.tracked.push(ob$)
      this.visited.push(ob$)

      return ob$.get(this.handler)
    }

    this.run()
  }

  protected clean() {
    const untrack: [Source<unknown>, number][] = []
    for (let i = 0; i < this.tracked.length; i++) {
      const t = this.tracked[i]!
      const index = this.visited.indexOf(t)
      if (index === -1) {
        untrack.push([t, i])
      }
    }

    for (let i = 0; i < untrack.length; i++) {
      const [t, index] = untrack[i]!
      t.remove(this.handler)
      this.tracked.splice(index, 1)
    }

    this.visited.length = 0
  }

  protected run() {
    const syncToken = Symbol()
    this.syncToken = syncToken

    const _res = this.fn(this.track)

    if (_res instanceof Promise) {
      _res.then(res => {
        if (this.syncToken !== syncToken) {
          return
        }

        this.clean()

        if (res !== SKIP) {
          this.emit(res)
        }
      })
    } else {
      const res = _res

      this.clean()

      if (res !== SKIP) {
        this.emit(res)
      }
    }
  }
}


export function observe<T>(fn: ExprFn<T>) {
  return new Observation(fn)
}
