<div align="right">

[![npm package minimized gzipped size)](https://img.shields.io/bundlejs/size/quel?style=flat-square&label=%20&color=black)](https://bundlejs.com/?q=quel)
[![types](https://img.shields.io/npm/types/quel?label=&color=black&style=flat-square)](./src/types.ts)
[![version](https://img.shields.io/npm/v/quel?label=&color=black&style=flat-square)](https://www.npmjs.com/package/quel)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/loreanvictor/quel/coverage.yml?label=%20&style=flat-square)](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml)

</div>

<img src="misc/dark.svg#gh-dark-mode-only" height="96px"/>
<img src="misc/light.svg#gh-light-mode-only" height="96px"/>

_Handle Change with Ease_ <sup>in JavaScript</sup>

```bash
npm i quel
```

<br>

**Change** happens when a button is clicked, when value of an input is changed as the user types, when the response to a request arrives, when data is pushed via some socket, when time passes, etc. [**quel**](.) helps you encapsulate sources of change, and combine, process and react to the resulting changing values via simple expressions and observations.
<!--
Most applications written in JavaScript require some degree of [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). This is either achieved via domain-specific frameworks (such as [React](https://reactjs.org)) or general-purpose libraries like [RxJS](https://rxjs.dev), which are centered around a [functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming) paradigm.

[**quel**](.) is a general-purpose library for reactive programming with an imperative style, resulting in code more in line with most other JavaScript code, and easier to read, write, understand and maintain. 
-->

```js
import { from, observe } from 'quel'


const div$ = document.querySelector('div')

// 👇 this is a source of change, as value of the input changes
const input = from(document.querySelector('textarea'))

// 👇 these are computed values based on that source
const chars = $ => $(input)?.length ?? 0
const words = $ => $(input)?.split(' ').length ?? 0

// 👇 this is a side effect executed when the computed values change
observe($ => div$.textContent = `${$(chars)} chars, ${$(words)} words`)
```

<div align="right">

[**▷ TRY IT**](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)

</div>

<br>

A more involved example:

```js
//
// this code creates a timer whose rate changes
// based on the value of an input
//

import { from, observe, Timer } from 'quel'


const div$ = document.querySelector('div')
const input = from(document.querySelector('input'))
const rate = $ => parseInt($(input) ?? 100)

//
// 👇 as the rate of the timer changes, so does the timer itself.
//    with a constant rate, the timer would be a simple source of change,
//    with changing rates, the timer becomes a "higher-order" source.
//
const timer = async $ => {
  await sleep(200)
  return $(rate) && new Timer($(rate))
}

observe($ => {
  //
  // 👇 `$(timer)` would yield the latest timer, 
  //     and `$($(timer))` would yield the latest
  //     value of that timer, which is what we want to display.
  //
  const elapsed = $($(timer)) ?? '-'
  div$.textContent = `elapsed: ${elapsed}`
})
```

<div align="right">

[**▷ TRY IT**](https://stackblitz.com/edit/js-4wppcl?file=index.js)

</div>

<br>

# Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Sources](#sources)
  - [Expressions](#expressions)
  - [Observation](#observation)
  - [Iteration](#iteration)
  - [Cleanup](#cleanup)
  - [Typing](#typing)
- [Features](#features)
- [Related Work](#related-work)
- [Contribution](#contribution)

<br>

# Installation

On [node](https://nodejs.org/en/):
```bash
npm i quel
```
On browser (or [deno](https://deno.land)):
```js
import { from, observe } from 'https://esm.sh/quel'
```

<br>

# Usage

Working with [**quel**](.) involves four stages:
1. Encapsulate (or create) [sources of change](#sources),
2. Process and combine the these changing values using [functions & expressions](#expressions),
3. [Observe](#observation) these changing values and react to them
   (or [iterate](#iteration) over them),
4. [Clean up](#cleanup) the sources, releasing resources (e.g. stop listening to user events, close an open socket, etc.).

## Sources

Create a subject (whose value you can manually set at any time):
```js
import { Subject } from 'quel'

const a = new Subject()
a.set(2)
```
Create a timer:
```js
import { Timer } from 'quel'

const timer = new Timer(1000)
```
Create an event source:
```js
import { from } from 'quel'

const click = from(document.querySelector('button'))
const hover = from(document.querySelector('button'), 'hover')
const input = from(document.querySelector('input'))
```
Create a custom source:
```js
import { Source } from 'quel'

const src = new Source(async emit => {
  await sleep(1000)
  emit('Hellow World!')
})
```
Read latest value of a source:
```js
src.get()
```
Stop a source:
```js
src.stop()
```
Wait for a source to be stopped:
```js
await src.stops()
```

<br>

## Expressions

Combine two sources:
```js
const sum = $ => $(a) + $(b)
```
Filter values:
```js
import { SKIP } from 'quel'

const odd = $ => $(a) % 2 === 0 ? SKIP : $(a)
```
Do async operations:
```js
const response = async $ => {
  await sleep(200)
  
  if ($(query)) {
    try {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon/' + $(query))
      const json = await res.json()

      return JSON.stringify(json, null, 2)
    } catch {
      return 'Could not find Pokemon'
    }
  }
}
```

<div align="right">

[**▷ TRY IT**](https://stackblitz.com/edit/js-3jpams?file=index.js)

</div>

Flatten higher-order sources:
```js
const variableTimer = $ => new Timer($(input))
const message = $ => 'elapsed: ' + $($(timer))
```
Stop the expression:
```js
import { STOP } from 'quel'

let count = 0
const take5 = $ => {
  if (count++ > 5) return STOP

  return $(src)
}
```

<br>

> ℹ️ **IMPORTANT**
>
> The `$` function, passed to expressions, _tracks_ and returns the latest value of a given source. Expressions
> are then re-evaluated every time a change in some tracked source results in some new value.
> This means that the sources you track must remain the same when the expression is re-evaluated.
>
> **DO NOT** create sources you want to track inside an expression:
> 
> ```js
> // 👇 this is WRONG ❌
> const computed = $ => $(new Timer(1000)) * 2
> ```
> ```js
> // 👇 this is CORRECT ✅
> const timer = new Timer(1000)
> const computed = $ => $(timer) * 2
> ```
>
> <br/>
> 
> You _CAN_ create new sources inside an expression and return them (without tracking) them, creating a higher-order source:
> ```js
> //
> // this is OK ✅
> // `timer` is a source of changing timers, 
> // who themselves are a source of changing numbers.
> //
> const timer = $ => new Timer($(rate))
> ```
> ```js
> //
> // this is OK ✅
> // `$(timer)` returns the latest timer as long as a new timer
> // is not created (in response to a change in `rate`), so this
> // expression is re-evaluated only when it needs to.
> //
> const msg = $ => 'elapsed: ' + $($(timer))
> ```
<br>

## Observation

Run side effects:
```js
import { observe } from 'quel'

observe($ => console.log($(message)))
```

Observations are sources themselves:
```js
const y = observe($ => $(x) * 2)
console.log(y.get())
```

Async expressions might get aborted mid-execution. You can handle those events by passing a second argument to `observe()`:
```js
let ctrl = new AbortController()

const data = observe(async $ => {
  await sleep(200)
  
  // 👇 pass abort controller signal to fetch to cancel mid-flight requests
  const res = await fetch('https://my.api/?q=' + $(input), {
    signal: ctrl.signal
  })

  return await res.json()
}, () => {
  ctrl.abort()
  ctrl = new AbortController()
})
```

<br>

## Iteration

Iterate on values of a source using `iterate()`:
```js
import { iterate } from 'quel'

for await (const i of iterate(src)) {
  // do something with it
}
```
If the source emits values faster than you consume them, you are going to miss out on them:
```js
const timer = new Timer(500)

// 👇 loop body is slower than the source. values will be lost!
for await (const i of iterate(timer)) {
  await sleep(1000)
  console.log(i)
}
```

<div align="right">

[**▷ TRY IT**](https://codepen.io/lorean_victor/pen/abKxbNw?editors=1010)

</div>

<br>

## Cleanup

Expressions cleanup automatically when all their tracked sources are stopped. They also lazy-check if all previously tracked sources
are still being tracked when they emit (or they stop) to do proper cleanup.

Manually cleanup:

```js
const timer = new Timer(1000)
const effect = observe($ => console.log($(timer)))

// 👇 this stops the timer and the effect
timer.stop()

// 👇 this just stops the side-effect, the timer keeps going.
effect.stop()
```

Specify cleanup code in custom sources:
```js
const myTimer = new Source(emit => {
  let i = 0
  const interval = setInterval(() => emit(++i), 1000)
  
  // 👇 clear the interval when the source is stopped
  return () => clearInterval(interval)
})
```
```js
// 👇 with async producers, use a callback to specify cleanup code
const asyncTimer = new Source(async (emit, finalize) => {
  let i = 0
  let stopped = false
  
  finalize(() => stopped = true)
  
  while (!stopped) {
    emit(++i)
    await sleep(1000)
  }
})
```

<br>

## Typing

TypeScript wouldn't be able to infer proper types for expressions. To resolve this issue, use `Track` type:

```ts
import { Track } from 'quel'

const expr = ($: Track) => $(a) * 2
```

👉 [Check this](src/types.ts) for more useful types.

<br>

# Features

🧩 [**quel**](.) has a minimal API surface (the whole package [is ~1.3KB](https://bundlephobia.com/package/quel@0.1.5)), and relies on composability instead of providng tons of operators / helper methods:

```js
// combine two sources:
$ => $(a) + $(b)
```
```js
// debounce:
async $ => {
  await sleep(1000)
  return $(src)
}
```
```js
// flatten (e.g. switchMap):
$ => $($(src))
```
```js
// filter a source
$ => $(src) % 2 === 0 ? $(src) : SKIP
```
```js
// take until other source emits a value
$ => !$(notifier) ? $(src) : STOP
```
```js
// merge sources
new Source(emit => {
  const obs = sources.map(src => observe($ => emit($(src))))
  return () => obs.forEach(ob => ob.stop())
})
```
```js
// throttle
let timeout = null
  
$ => {
  const value = $(src)
  if (timeout === null) {
    timeout = setTimeout(() => timeout = null, 1000)
    return value
  } else {
    return SKIP
  }
}
```

<br>

🛂 [**quel**](.) is imperative (unlike most other general-purpose reactive programming libraries such as [RxJS](https://rxjs.dev), which are functional), resulting in code that is easier to read, write and debug:

```js
import { interval, map, filter } from 'rxjs'

const a = interval(1000)
const b = interval(500)

combineLatest(a, b).pipe(
  map(([x, y]) => x + y),
  filter(x => x % 2 === 0),
).subscribe(console.log)
```
```js
import { Timer, observe } from 'quel'

const a = new Timer(1000)
const b = new Timer(500)

observe($ => {
  const sum = $(a) + $(b)
  if (sum % 2 === 0) {
    console.log(sum)
  }
})
```

<br>

⚡ [**quel**](.) is as fast as [RxJS](https://rxjs.dev). Note that in most cases performance is not the primary concern when programming reactive applications (since you are handling async events). If performance is critical for your use case, I'd recommend using likes of [xstream](http://staltz.github.io/xstream/) or [streamlets](https://github.com/loreanvictor/streamlet), as the imperative style of [**quel**](.) does tax a performance penalty inevitably compared to the fastest possible implementation.

<br>

🧠 [**quel**](.) is more memory-intensive than [RxJS](https://rxjs.dev). Similar to the unavoidable performance tax, tracking sources of an expression will use more memory compared to explicitly tracking and specifying them.

<br>

☕ [**quel**](.) only supports [hot](https://rxjs.dev/guide/glossary-and-semantics#hot) [listenables](https://rxjs.dev/guide/glossary-and-semantics#push). Certain use cases would benefit (for example, in terms of performance) from using cold listenables, or from having hybrid pull-push primitives. However,  most common event sources (user events, timers, Web Sockets, etc.) are hot listenables, and [**quel**](.) does indeed use the limited scope for simplification and optimization of its code.

<br>

# Related Work

- [**quel**](.) is inspired by [rxjs-autorun](https://github.com/kosich/rxjs-autorun) by [@kosich](https://github.com/kosich).
- [**quel**](.) is basically an in-field experiment on ideas discussed in detail [here](https://github.com/loreanvictor/reactive-javascript).
- [**quel**](.)'s focus on hot listenables was inspired by [xstream](https://github.com/staltz/xstream).

<br>

# Contribution

You need [node](https://nodejs.org/en/), [NPM](https://www.npmjs.com) to start and [git](https://git-scm.com) to start.

```bash
# clone the code
git clone git@github.com:loreanvictor/quel.git
```
```bash
# install stuff
npm i
```

Make sure all checks are successful on your PRs. This includes all tests passing, high code coverage, correct typings and abiding all [the linting rules](https://github.com/loreanvictor/quel/blob/main/.eslintrc). The code is typed with [TypeScript](https://www.typescriptlang.org), [Jest](https://jestjs.io) is used for testing and coverage reports, [ESLint](https://eslint.org) and [TypeScript ESLint](https://typescript-eslint.io) are used for linting. Subsequently, IDE integrations for TypeScript and ESLint would make your life much easier (for example, [VSCode](https://code.visualstudio.com) supports TypeScript out of the box and has [this nice ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)), but you could also use the following commands:

```bash
# run tests
npm test
```
```bash
# check code coverage
npm run coverage
```
```bash
# run linter
npm run lint
```
```bash
# run type checker
npm run typecheck
```

You can also use the following commands to run performance benchmarks:

```bash
# run all benchmarks
npm run bench
```
```bash
# run performance benchmarks
npm run bench:perf
```
```bash
# run memory benchmarks
npm run bench:mem
```

<br><br>
