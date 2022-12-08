import { Timer } from '../timer'


describe(Timer, () => {
  test('counts time.', () => {
    jest.useFakeTimers()

    const timer = new Timer(100)
    const listener = jest.fn()

    timer.get(listener)

    jest.advanceTimersByTime(10)
    expect(listener).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)

    jest.advanceTimersByTime(100)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith(2)

    jest.useRealTimers()
  })

  test('stops', () => {
    jest.useFakeTimers()

    const timer = new Timer(100)
    const listener = jest.fn()

    timer.get(listener)

    jest.advanceTimersByTime(100)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)

    timer.stop()

    jest.advanceTimersByTime(100)
    expect(listener).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })
})
