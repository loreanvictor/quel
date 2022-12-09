import { iterate } from '../iterate'
import { Timer } from '../timer'


describe(iterate, () => {
  test('iterates on a source.', async () => {
    const cb = jest.fn()

    const t = new Timer(10)
    setTimeout(() => t.stop(), 50)

    for await (const i of iterate(t)) {
      cb(i)
    }

    expect(cb).toHaveBeenCalledTimes(4)
  })
})
