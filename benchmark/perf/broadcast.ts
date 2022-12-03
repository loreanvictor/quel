import { benchmark } from './util/benchmark'

import { Subject as sSubject, observe as sobserve } from 'streamlets'
import { Subject as rSubject } from 'rxjs'
import xs from 'xstream'
import { Subject } from '../../src'


const data = [...Array(10_000).keys()]
const listeners = [...Array(1_00).keys()]

benchmark('broadcast', {
  RxJS: () => {
    const a = new rSubject<number>()

    listeners.forEach(() => a.subscribe())
    data.forEach(x => a.next(x))
  },

  Streamlets: () => {
    const a = new sSubject<number>()

    listeners.forEach(() => sobserve(a))
    data.forEach(x => a.receive(x))
  },

  Quel: () => {
    const a = new Subject<number>()

    listeners.forEach(() => a.get(() => {}))
    data.forEach(x => a.set(x))
  },

  XStream: () => {
    const a = xs.create<number>()

    listeners.forEach(() => a.subscribe({
      next: () => {},
      error: () => {},
      complete: () => {},
    }))

    data.forEach(x => a.shamefullySendNext(x))
  }
})
