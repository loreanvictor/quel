import sleep from 'sleep-promise'

import { Source } from '../source'
import { Subject } from '../subject'


describe(Source, () => {
  test('emits', () => {
    const signal = new Subject<void>()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)

    signal.set()
    expect(listener).toHaveBeenCalledWith(1)

    signal.set()
    expect(listener).toHaveBeenCalledWith(2)
  })

  test('removes listeners.', () => {
    const signal = new Subject<void>()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)
    signal.set()
    expect(listener).toHaveBeenCalledWith(1)

    listener.mockReset()

    source.remove(listener)
    signal.set()
    expect(listener).not.toHaveBeenCalled()
  })

  test('clears up.', () => {
    const signal = new Subject<void>()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)
    signal.set()
    expect(listener).toHaveBeenCalledWith(1)

    listener.mockReset()

    source.stop()
    signal.set()
    expect(listener).not.toHaveBeenCalled()
  })

  test('can do async sources.', async () => {
    const source = new Source(async emit => {
      await sleep(10)
      emit(1)
    })

    expect(source.get()).toBeUndefined()

    await sleep(20)

    expect(source.get()).toBe(1)
  })

  test('can pass cleanup code in async functions too.', async () => {
    const source = new Source(async (emit, finalize) => {
      let i = 0
      let stopped = false

      finalize(() => stopped = true)

      while (!stopped) {
        emit(++i)
        await sleep(5)
      }
    })

    expect(source.get()).toBe(1)
    await sleep(5)
    expect(source.get()).toBe(2)
    await sleep(5)
    expect(source.get()).toBe(3)
    source.stop()
    await sleep(5)
    expect(source.get()).toBe(3)
  })

  test('can wait for it to stop.', async () => {
    const source = new Source()
    setTimeout(() => source.stop(), 10)

    await source.stops()
  })

  test('is disposable.', async () => {
    const cb = jest.fn()
    const cb2 = jest.fn()

    {
      using src = new Source(emit => {
        setTimeout(() => emit(1), 1)
        setTimeout(() => emit(2), 5)

        return cb
      })

      src.get(cb2)

      await sleep(2)
    }

    await sleep(10)

    expect(cb).toHaveBeenCalled()
    expect(cb2).toHaveBeenCalledWith(1)
    expect(cb2).not.toHaveBeenCalledWith(2)
  })

  test('provides disposable subscriptions.', () => {
    const cb = jest.fn()
    const src = new Subject<number>()

    {
      using _ = src.subscribe(cb)
      src.set(1)
    }

    src.set(2)

    expect(cb).toHaveBeenCalledWith(1)
    expect(cb).not.toHaveBeenCalledWith(2)
  })
})
