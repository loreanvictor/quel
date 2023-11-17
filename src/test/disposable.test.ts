import { dispose, disposable } from '../disposable'


describe(disposable, () => {
  test('disposes.', () => {
    const cb = jest.fn()

    {
      using _ = disposable(cb)
    }

    expect(cb).toHaveBeenCalled()
  })
})


describe(dispose, () => {
  test('disposes.', () => {
    const cb = jest.fn()
    const _ = disposable(cb)

    expect(cb).not.toHaveBeenCalled()

    dispose(_)

    expect(cb).toHaveBeenCalled()
  })

  test('does nothing if not disposable.', () => {
    dispose(undefined as any)
    dispose(null as any)
    dispose({} as any)
    dispose([] as any)
    dispose(1 as any)
    dispose('1' as any)
    dispose(true as any)
    dispose(Symbol('1') as any)
  })
})
