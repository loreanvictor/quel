import chalk from 'chalk'
import { table, getBorderCharacters } from 'table'

import { test } from './test'
import { format } from './format'


export function benchmark(name: string, libs: { [lib: string]: () => () => void}) {
  const suites = Object.entries(libs).sort(() => Math.random() > .5 ? 1 : -1)
  const results: [string, number, number][] = []

  console.log(chalk`{yellowBright mem}: {bold ${name}}`)

  suites.forEach(([lib, fn]) => {
    const res = test(fn)
    results.push([lib, res.heap, res.rme])
    console.log(chalk`  {green ✔} ${lib}`
    + chalk` {gray ${Array(32 - lib.length).join('.')} ${res.samples.length} runs}`
    )
  })

  console.log()
  console.log(table(
    results
      .sort((a, b) => a[1] - b[1])
      .map(([lib, heap, rme]) => ([
        chalk`{bold ${lib}}`,
        chalk`{green.bold ${format(heap)}}`,
        chalk`{gray ±${rme.toFixed(2)}%}`,
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
}
