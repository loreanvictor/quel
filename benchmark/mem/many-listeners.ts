import { benchmark } from './util/benchmark'

import { pipe as spipe, Subject as sSubject, map as smap, filter as sfilter, observe as sobserve } from 'streamlets'
import { Subject as rSubject, map as rmap, filter as rfilter } from 'rxjs'
import { Subject, observe, SKIP, Track } from '../../src'


const data = [...Array(50_000).keys()]
const listeners = [...Array(20).keys()]

benchmark('many listeners', {
  RxJS: () => {
    const a = new rSubject<number>()

    const o = a.pipe(
      rmap(x => x * 3),
      rfilter(x => x % 2 === 0)
    )

    const subs = listeners.map(() => o.subscribe())
    data.forEach(x => a.next(x))

    return () => subs.forEach(s => s.unsubscribe())
  },

  Streamlets: () => {
    const a = new sSubject<number>()

    const s = spipe(
      a,
      smap(x => x * 3),
      sfilter(x => x % 2 === 0),
    )

    const obs = listeners.map(() => sobserve(s))
    data.forEach(x => a.receive(x))

    return () => obs.forEach(ob => ob.stop())
  },

  Quel: () => {
    const a = new Subject<number>()
    const e = ($: Track) => {
      const b = $(a)! * 3

      return b % 2 === 0 ? b : SKIP
    }

    const obs = listeners.map(() => observe(e))
    data.forEach(x => a.set(x))

    return () => obs.forEach(ob => ob.stop())
  },
})
