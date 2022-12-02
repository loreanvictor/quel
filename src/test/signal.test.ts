import { Signal } from '../signal'


describe(Signal, () => {
  test('emits', () => {
    const signal = new Signal()
    const listener = jest.fn()
    signal.get(listener)
    signal.send()
    expect(listener).toHaveBeenCalled()
  })
})
