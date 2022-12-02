import { benchmark } from './util/benchmark'

import { pipe as spipe, Subject as sSubject, map as smap, filter as sfilter, observe as sobserve } from 'streamlets'
// import { expr as sexpr, SKIP as sSKIP } from 'streamlets'
import { Subject as rSubject, map as rmap, filter as rfilter } from 'rxjs'
import { Subject, observe, SKIP } from '../../src'


const data = [...Array(1_000_000).keys()]

benchmark('simple', {
  RxJS: () => {
    const a = new rSubject<number>()

    const s = a.pipe(
      rmap(x => x * 3),
      rfilter(x => x % 2 === 0)
    ).subscribe()

    data.forEach(x => a.next(x))

    return () => s.unsubscribe()
  },

  Streamlets: () => {
    const a = new sSubject<number>()

    const o = spipe(
      a,
      smap(x => x * 3),
      sfilter(x => x % 2 === 0),
      sobserve,
    )

    data.forEach(x => a.receive(x))

    return () => o.stop()
  },

  // StreamletExpr: () => {
  //   const a = new sSubject<number>()

  //   const o = spipe(
  //     sexpr($ => {
  //       const x = $(a) * 3

  //       return x % 2 === 0 ? x : sSKIP
  //     }),
  //     sobserve
  //   )

  //   data.forEach(x => a.receive(x))

  //   return () => o.stop()
  // },

  Quel: () => {
    const a = new Subject<number>()
    const o = observe($ => {
      const b = $(a)! * 3

      return b % 2 === 0 ? b : SKIP
    })

    data.forEach(x => a.set(x))

    return () => o.stop()
  },
})
