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

    source.clear()
    signal.send()
    expect(listener).not.toHaveBeenCalled()
  })
})
