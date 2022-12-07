import { Signal } from '../signal'


describe(Signal, () => {
  test('emits', () => {
    const signal = new Signal()
    const listener = jest.fn()
    signal.get(listener)
    signal.send()
    expect(listener).toHaveBeenCalled()
  })

  test('gets listeners once.', () => {
    const signal = new Signal()
    const listener = jest.fn()
    signal.once(listener)
    signal.send()
    expect(listener).toHaveBeenCalledTimes(1)
    signal.send()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
