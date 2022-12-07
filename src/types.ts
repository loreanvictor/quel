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
}

export const SKIP = Symbol()

export type Track = <T>(obs: Observable<T>) => T | undefined
export type ExprFn<T> = (track: Track) => T | typeof SKIP
export type Observable<T> = SourceLike<T> | ExprFn<T>
