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
}

export const SKIP = Symbol()
export const STOP = Symbol()

export type ExprResultSync<T> = T | typeof SKIP | typeof STOP
export type ExprResult<T> = ExprResultSync<T> | Promise<ExprResultSync<T>>
export type Track = <T>(obs: Observable<T>) => T | undefined
export type ExprFn<T> = (track: Track) => ExprResult<T>
export type Observable<T> = SourceLike<T> | ExprFn<T>
