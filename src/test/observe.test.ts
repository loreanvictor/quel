// import sleep from 'sleep-promise'
import { Subject } from '../subject'
import { observe, Track } from '../observe'


describe(observe, () => {
  test('runs expression.', () => {
    const cb = jest.fn()

    const a = new Subject<number>()
    const b = new Subject<number>()
    const c = ($: Track) => $(a)! + $(b)!
    observe($ => cb($(c)! * 2))

    a.set(1)
    b.set(2)

    expect(cb).toHaveBeenCalledWith(6)

    a.set(3)
    expect(cb).toHaveBeenCalledWith(10)
  })

  test('flattens expressions.', () => {
    const cb = jest.fn()

    const a = new Subject<Subject<number>>()
    const b = new Subject<number>()
    const c = new Subject<number>()

    a.set(b)

    observe($ => $($(a)!)).get(cb)

    b.set(1)
    expect(cb).toHaveBeenCalledWith(1)

    a.set(c)
    expect(cb).toHaveBeenCalledWith(undefined)

    c.set(2)
    expect(cb).toHaveBeenCalledWith(2)

    cb.mockReset()
    b.set(3)
    expect(cb).not.toHaveBeenCalled()
  })

  test('cleans up.', () => {
    const cb = jest.fn()

    const a = new Subject<number>()
    a.set(1)

    const o = observe($ => cb($(a)))
    expect(cb).toHaveBeenCalledWith(1)

    o.stop()
    a.set(2)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('runs async functions.', async () => {
    jest.useFakeTimers()
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const cb = jest.fn()

    const a = new Subject<number>()

    observe(async $ => {
      const val = $(a)
      await sleep(10)
      cb(val)
    })

    a.set(1)
    expect(cb).not.toHaveBeenCalled()

    jest.advanceTimersByTime(10)
    await Promise.resolve()

    expect(cb).toHaveBeenCalledWith(1)

    jest.useRealTimers()
  })

  test('cancels mid-flight runs.', async () => {
    const cb = jest.fn()
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const a = new Subject<number>()

    const o = observe(async $ => {
      const val = $(a)
      await sleep(10)

      return val
    })

    o.get(cb)
    a.set(1)
    await sleep(5)
    a.set(2)
    await sleep(10)
    a.set(3)

    await sleep(10)

    expect(cb).not.toHaveBeenCalledWith(undefined)
    expect(cb).not.toHaveBeenCalledWith(1)
    expect(cb).toHaveBeenCalledWith(2)
    expect(cb).toHaveBeenCalledWith(3)
  })

  test('ignores when tracking undefined.', () => {
    expect(() => observe($ => $(undefined as any))).not.toThrow()
  })

  test('does not track when run is cancelled.', async () => {
    const cb = jest.fn()
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const a = new Subject<number>()
    const b = new Subject()
    const c = new Subject()

    b.set('B')
    c.set('C')

    observe(async $ => {
      cb()
      const rate = $(a) ?? 0
      await sleep(rate)

      return rate % 2 === 0 ? $(b) : $(c)
    })

    a.set(10)
    await sleep(5)
    a.set(11)
    await sleep(15)

    expect(cb).toHaveBeenCalledTimes(3)

    b.set('b')
    expect(cb).toHaveBeenCalledTimes(3)
  })

  test('accepts an abort listener.', () => {
    const abort = jest.fn()

    const a = new Subject<number>()
    observe($ => $(a)! * 2, abort)

    expect(abort).not.toHaveBeenCalled()
    a.set(1)
    expect(abort).toHaveBeenCalledTimes(1)
    a.set(2)
    expect(abort).toHaveBeenCalledTimes(2)
  })
})
