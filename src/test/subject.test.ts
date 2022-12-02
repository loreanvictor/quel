import { Subject } from '../subject'


describe(Subject, () => {
  test('emits value.', () => {
    const subject = new Subject<number>()
    const listener = jest.fn()

    subject.get(listener)
    subject.set(1)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)
  })
})
