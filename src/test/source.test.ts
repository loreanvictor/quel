import { Source } from '../source'
import { Signal } from '../signal'


describe(Source, () => {
  test('emits', () => {
    const signal = new Signal()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)

    signal.send()
    expect(listener).toHaveBeenCalledWith(1)

    signal.send()
    expect(listener).toHaveBeenCalledWith(2)
  })

  test('removes listeners.', () => {
    const signal = new Signal()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)
    signal.send()
    expect(listener).toHaveBeenCalledWith(1)

    listener.mockReset()

    source.remove(listener)
    signal.send()
    expect(listener).not.toHaveBeenCalled()
  })

  test('clears up.', () => {
    const signal = new Signal()
    const source = new Source(emit => {
      let i = 0
      const handler = () => emit(++i)
      signal.get(handler)

      return () => signal.remove(handler)
    })

    const listener = jest.fn()
    source.get(listener)
    signal.send()
    expect(listener).toHaveBeenCalledWith(1)

    listener.mockReset()

    source.stop()
    signal.send()
    expect(listener).not.toHaveBeenCalled()
  })

  test('can do async sources.', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const source = new Source(async emit => {
      await sleep(10)
      emit(1)
    })

    expect(source.get()).toBeUndefined()

    await sleep(20)

    expect(source.get()).toBe(1)
  })

  test('can pass cleanup code in async functions too.', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
})
