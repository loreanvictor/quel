import sleep from 'sleep-promise'

import { Subject } from '../subject'
import { observe } from '../observe'


test('can batch emissions.', async () => {
  const a = new Subject<number>()
  const batched = async $ => (await Promise.resolve(), $(a))

  const cb = jest.fn()
  observe($ => $(batched) && cb($(batched)))

  a.set(1)
  a.set(2)
  a.set(3)

  await sleep(1)

  expect(cb).toHaveBeenCalledWith(3)
  expect(cb).toHaveBeenCalledTimes(1)
})
