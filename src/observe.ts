import { Listener, SourceLike, isSourceLike, Observable, ExprFn, SKIP, STOP, ExprResultSync } from './types'
import { Source } from './source'


/**
 * turns an object, that might be an expression function or a source, into a source.
 * will attach the created source on the expression function and reuse it on subsequent calls.
 *
 * @param {Observable<T>} fn the object to normalize
 * @returns {SourceLike<T>}
 */
function normalize<T>(fn: Observable<T>): SourceLike<T> {
  if (typeof fn === 'function') {
    (fn as any).__observed__ ??= observe(fn)

    return (fn as any).__observed__
  } else {
    return fn
  }
}


/**
 * Represents an observation of an expression. An expression is a function that can track
 * some other sources and its return value depends on the values of those sources. This tracking
 * needs to be done explicitly via the _track function_ passed to the expression.
 *
 * Whenever a tracked source emits a value, the expression function is re-run, and its new value
 * is emitted. For each re-run of the expression function, the latest value emitted by each source
 * is used. An initial dry-run is performed upon construction to track necessary sources.
 *
 * @example
 * ```ts
 * const a = makeASource<number>()
 * const b = makeAnotherSource<number>()
 *
 * const expr = $ => $(a) + $(b)
 * const obs = new Observation(expr)
 * ```
 */
export class Observation<T> extends Source<T> {
  /**
   * A mapping of all tracked sources. For receiving the values of tracked sources,
   * a handler is registered with them. this handler is stored in this map for cleanup.
   */
  tracked: Map<SourceLike<any>, Listener<any>> = new Map()

  /**
   * A candidate tracked source for cleanup. If a tracked source initiates a rerun
   * by emitting, it is marked as a clean candidate. If the source is not re-tracked (i.e. used)
   * in the next run, it will be cleaned up.
   */
  cleanCandidate: SourceLike<any> | undefined

  /**
   * A token to keep track of the current run. If the expression is re-run
   * before a previous run is finished (which happens in case of async expressions),
   * then the value of the out-of-sync run is discarded.
   */
  syncToken = 0

  /**
   * The last sync token. If this is different from the current sync token,
   * then the last started execution has not finished yet.
   */
  lastSyncToken = 0

  /**
   * @param {ExprFn<T>} fn the expression to observe
   * @param {Listener<void>} abort a listener to call when async execution is aborted
   */
  constructor(
    readonly fn: ExprFn<T>,
    readonly abort?: Listener<void>,
  ) {
    super(() => () => {
      this.tracked.forEach((h, t) => t.remove(h))
      this.tracked.clear()
    })

    // do a dry run on init, to track all sources
    this.run()
  }

  /**
   * cleans the clean candidate if present.
   * @returns true if observation was already clean (no clean candidate), false otherwise.
   */
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

  /**
   * creates a new sync token to distinguish async executions that should be aborted.
   * will call the abort listener if some execution is aborted.
   * @returns a new sync token.
   */
  protected nextToken() {
    if (this.syncToken > 0) {
      // check if there is an unfinished run that needs to be aborted
      if (this.lastSyncToken !== this.syncToken) {
        this.abort && this.abort()
      }
      // if this is a higher-order observation, the last emitted source
      // should be stopped.
      isSourceLike(this.last) && this.last.stop()
    }

    /* istanbul ignore next */
    return ++this.syncToken > 10e12 ? this.syncToken = 1 : this.syncToken
  }

  /**
   *
   */
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
    // emission means last run is finished,
    // so sync tokens should be synced.
    this.lastSyncToken = this.syncToken

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

    if (!src.stopped && !this.tracked.has(src)) {
      const handler = () => this.run(src)
      this.tracked.set(src, handler)
      src.stops().then(() => this.checkStop(src))

      return src.get(handler)
    } else {
      return src.get()
    }
  }

  protected checkStop(src: SourceLike<unknown>) {
    this.tracked.delete(src)
    if (this.tracked.size === 0) {
      this.stop()
    }
  }
}


export function observe<T>(fn: ExprFn<T>, abort?: Listener<void>) {
  return new Observation(fn, abort)
}
