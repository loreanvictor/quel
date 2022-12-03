import { benchmark } from './util/benchmark'

import { pipe as spipe, Subject as sSubject, map as smap, filter as sfilter, observe as sobserve } from 'streamlets'
import { Subject as rSubject, map as rmap, filter as rfilter } from 'rxjs'
import xs from 'xstream'
import { Subject, observe, SKIP, Track } from '../../src'


const data = [...Array(1_000).keys()]
const listeners = [...Array(1_00).keys()]

benchmark('many listeners', {
  RxJS: () => {
    const a = new rSubject<number>()

    const o = a.pipe(
      rmap(x => x * 3),
      rfilter(x => x % 2 === 0)
    )

    listeners.forEach(() => o.subscribe())
    data.forEach(x => a.next(x))
  },

  Streamlets: () => {
    const a = new sSubject<number>()

    const s = spipe(
      a,
      smap(x => x * 3),
      sfilter(x => x % 2 === 0),
    )

    listeners.forEach(() => sobserve(s))
    data.forEach(x => a.receive(x))
  },

  Quel: () => {
    const a = new Subject<number>()
    const e = ($: Track) => {
      const b = $(a)! * 3

      return b % 2 === 0 ? b : SKIP
    }

    listeners.forEach(() => observe(e))
    data.forEach(x => a.set(x))
  },

  XStream: () => {
    const a = xs.create<number>()

    const s = a.map(x => x * 3)
      .filter(x => x % 2 === 0)

    listeners.forEach(() => s.subscribe({
      next: () => {},
      error: () => {},
      complete: () => {},
    }))
    data.forEach(x => a.shamefullySendNext(x))
  },
})
