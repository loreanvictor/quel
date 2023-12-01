import { Listener, SourceLike, isSourceLike, Observable, ExprFn, SKIP, STOP, ExprResultSync, isPure } from './types'
import { Source } from './source'


/**
 * Turns an object, that might be an expression function or a source, into a source.
 * Will attach the created source on the expression function and reuse it on subsequent calls.
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
  ctrl: AbortController | undefined
  /**
   * A mapping of all tracked sources. For receiving the values of tracked sources,
   * a handler is registered with them. This handler is stored in this map for cleanup.
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
   * Cleans the observation if necessary. The observation is "dirty" if
   * the last initiated run was initiated by a source that is no longer tracked
   * by the expression. The observation will always be clean after calling this method.
   *
   * @returns {boolean} true if the observation is clean (before cleaning up), false otherwise.
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
        this.ctrl?.abort()
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
   * Runs the expression function and emits its result.
   * @param {SourceLike<any>} src the source that initiated the run, if any.
   */
  protected run(src?: SourceLike<any>) {
    this.cleanCandidate = src
    const syncToken = this.nextToken()

    // const _res = this.fn(obs => obs ? this.track(normalize(obs), syncToken) : undefined)
    const _res = this.execute(syncToken)

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

  /**
   * Executes the expression with given sync token. If the expression is abortable, will
   * create a new AbortController and pass its signal to the expression.
   * @param syncToken the token to check if the execution should be aborted
   * @returns the result of the expression (sync or async)
   */
  protected execute(syncToken: number) {
    if (isPure(this.fn)) {
      return this.fn(obs => obs ? this.track(normalize(obs), syncToken) : undefined)
    } else {
      this.ctrl = new AbortController()
      const signal = this.ctrl.signal

      return this.fn(obs => obs ? this.track(normalize(obs), syncToken) : undefined, signal)
    }
  }

  /**
   * Emits the result of the expression function if the observation is clean. The observation
   * is "dirty" if the last initiated run was initiated by a source that is no longer tracked. This happens
   * when a source is conditionally tracked or when a higher-order tracked source emits a new inner-source or stops.
   *
   * This method will also skip the emission if the result is SKIP or STOP. In case of STOP, the observation
   * is stopped. This allows expressions to control flow of the observation in an imparative manner.
   *
   * @param {ExprResultSync<T>} res the result to emit
   */
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

  /**
   * Tracks a source and returns the latest value emitted by it. If the source is being tracked for the first time,
   * will register a listener with it to re-run the expression when it emits.
   *
   * @returns The latest value emitted by the source, or undefined if there was a subsequent run after the run
   * that initiated the tracking (so expression can realize mid-flight if they are aborted).
   */
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

  /**
   * Removes a source from the tracked sources. If this was the last tracked source,
   * the observation is stopped.
   */
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
