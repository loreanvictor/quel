import { benchmark } from './util/benchmark'

import { pipe as spipe, Subject as sSubject, map as smap, filter as sfilter, observe as sobserve } from 'streamlets'
import { Subject as rSubject, map as rmap, filter as rfilter } from 'rxjs'
import xs from 'xstream'
import { Subject, observe, SKIP } from '../../src'


const data = [...Array(1_000).keys()]

benchmark('simple', {
  RxJS: () => {
    const a = new rSubject<number>()

    a.pipe(
      rmap(x => x * 3),
      rfilter(x => x % 2 === 0)
    ).subscribe()

    data.forEach(x => a.next(x))
  },

  Streamlets: () => {
    const a = new sSubject<number>()

    spipe(
      a,
      smap(x => x * 3),
      sfilter(x => x % 2 === 0),
      sobserve,
    )

    data.forEach(x => a.receive(x))
  },

  Quel: () => {
    const a = new Subject<number>()
    observe($ => {
      const b = $(a)! * 3

      return b % 2 === 0 ? b : SKIP
    })

    data.forEach(x => a.set(x))
  },

  XStream: () => {
    const a = xs.create<number>()

    a.map(x => x * 3)
      .filter(x => x % 2 === 0)
      .subscribe({
        next: () => {},
        error: () => {},
        complete: () => {},
      })

    data.forEach(x => a.shamefullySendNext(x))
  }
})
