import { Source } from './source'


export class Timer extends Source<number> {
  constructor(readonly interval: number) {
    super(emit => {
      let i = 0
      const id = setInterval(() => emit(i++), interval)

      return () => clearInterval(id)
    })
  }
}
