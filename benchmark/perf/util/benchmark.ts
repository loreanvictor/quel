import Benchmark, { Event } from 'benchmark'
import { table, getBorderCharacters } from 'table'
import chalk from 'chalk'


export function benchmark(name: string, libs: { [lib: string]: () => void}) {
  const suite = new Benchmark.Suite(name)
  const results: [string, number, number][] = []

  Object.entries(libs).sort(() => Math.random() > .5 ? 1 : -1).forEach(([lib, impl]) => suite.add(lib, impl))
  console.log(chalk`{blue perf}: {bold ${name}}`)

  suite
    .on('cycle', function(event: Event) {
      console.log(
        chalk`  {green ✔} ${event.target.name}`
        + chalk` {gray ${Array(32 - event.target.name!.length).join('.')} ${event.target.stats?.sample.length} runs}`
      )
      results.push([event.target.name!, event.target.hz!, event.target.stats!.rme])
    })
    .on('complete', function(this: any) {
      console.log()
      console.log(table(
        results
          .sort((a, b) => b[1] - a[1])
          .map(([lib, ops, rme]) => ([
            chalk`{bold ${lib}}`,
            chalk`{green.bold ${Benchmark.formatNumber(ops.toFixed(0) as any)}} ops/sec`,
            chalk`{gray ±${Benchmark.formatNumber(rme.toFixed(2) as any) + '%'}}`,
          ])),
        {
          columns: {
            0: { width: 20 },
            1: { width: 30 },
            2: { width: 10 }
          },
          border: getBorderCharacters('norc')
        }
      ))
    })
    .run({ async: false })
}
