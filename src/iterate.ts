import { SourceLike } from './types'


export async function* iterate<T>(src: SourceLike<T>) {
  let resolve: ((pack: { val: T }) => void) | undefined = undefined
  let promise = new Promise<{val: T}>(res => resolve = res)

  src.get(t => {
    resolve!({val: t})
    promise = new Promise<{val: T}>(res => resolve = res)
  })

  while (true) {
    const pack = await Promise.race([promise, src.stops()])
    if (pack) {
      yield pack.val
    } else {
      return
    }
  }
}
