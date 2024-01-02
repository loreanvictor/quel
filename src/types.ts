export type Listener<T> = (val: T) => void
export type Cleanup = () => void
export type Producer<T> = (
  listener: Listener<T>,
  finalize: (cleanup: Cleanup) => void
) => Cleanup | void | Promise<void>

export interface SourceLike<T> {
  get(listener?: Listener<T>): T | undefined
  remove(listener: Listener<T>): void
  stop(): void
  stops(): Promise<void>
  stopped: boolean
}

export function isSourceLike<T>(val: any): val is SourceLike<T> {
  return val &&
    typeof val.get === 'function' &&
    typeof val.remove === 'function' &&
    typeof val.stop === 'function' &&
    typeof val.stops === 'function'
}

export const SKIP = Symbol()
export const STOP = Symbol()

export type ExprResultSync<T> = T | typeof SKIP | typeof STOP
export type ExprResult<T> = ExprResultSync<T> | Promise<ExprResultSync<T>>
export type Track = <T>(obs: Observable<T>) => T | undefined
export type PureExprFn<T> = (track: Track) => ExprResult<T>
export type AbortableExprFn<T> = (track: Track, signal: AbortSignal) => ExprResult<T>
export type ExprFn<T> = PureExprFn<T> | AbortableExprFn<T>

export function isPure<T>(fn: ExprFn<T>): fn is PureExprFn<T> {
  return fn.length === 1
}

export type Observable<T> = SourceLike<T> | ExprFn<T>
