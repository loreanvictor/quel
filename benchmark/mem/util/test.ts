import { average, rme } from './stats'


type Data = {
  heapTotal: number,
  heapUsed: number,
}

function sample(fn: () => () => void) {
  const initial = process.memoryUsage()
  const dispose = fn()
  const final = process.memoryUsage()

  dispose()
  // eslint-disable-next-line no-unused-expressions
  gc && gc()

  return {
    heapTotal: final.heapTotal - initial.heapTotal,
    heapUsed: final.heapUsed - initial.heapUsed,
  }
}

export function test(fn: () => () => void, N = 64, warmup = 16) {
  const samples: Data[] = []

  for (let i = 0; i < warmup; i++) {
    sample(fn)
  }

  for (let i = 0; i < N; i++) {
    samples.push(sample(fn))
  }

  return {
    samples,
    warmup,
    heap: average(samples.map(s => s.heapUsed)),
    rme: rme(samples.map(s => s.heapUsed)),
  }
}
