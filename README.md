<div align="right">

[![npm package minimized gzipped size)](https://img.shields.io/bundlejs/size/quel?style=flat-square&label=%20&color=black)](https://bundlejs.com/?q=quel)
[![types](https://img.shields.io/npm/types/quel?label=&color=black&style=flat-square)](./src/types.ts)
[![version](https://img.shields.io/npm/v/quel?label=&color=black&style=flat-square)](https://www.npmjs.com/package/quel)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/loreanvictor/quel/coverage.yml?label=%20&style=flat-square)](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml)

</div>

<img src="misc/dark.svg#gh-dark-mode-only" height="96px"/>
<img src="misc/light.svg#gh-light-mode-only" height="96px"/>

_Reactive Expressions for JavaScript_

```bash
npm i quel
```

**quel** is a tiny library for reactive programming in JavaScript. Use it to write applications that handle user interactions, events, timers, web sockets, etc. using only simple functions.

```js
import { from, observe } from 'quel'


const div$ = document.querySelector('div')

// 👇 encapsulate the value of the input
const input = from(document.querySelector('textarea'))

// 👇 compute some other values based on that (changing) value
const chars = $ => $(input)?.length ?? 0
const words = $ => $(input)?.split(' ').length ?? 0

// 👇 use the calculated value in a side-effect
observe($ => div$.textContent = `${$(chars)} chars, ${$(words)} words`)
```

<div align="right">

[**▷ TRY IT**](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)

</div>

<br>

**quel** focuses on simplicity and composability. Even complex scenarios (such as higher-order reactive sources, debouncing events, etc.)
are implemented with plain JS functions combined with each other (instead of operators, hooks, or other custom abstractions).

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
// 👇 wait a little bit after the input value is changed (debounce),
//    then create a new timer with the new rate.
//
//    `timer` is a "higher-order" source of change, because
//    its rate also changes based on the value of the input.
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
  - [Custom Sources](#custom-sources)
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

1. Encapsulate (or create) [sources of change](#sources),
  ```js
  const timer = new Timer(1000)
  const input = from(document.querySelector('#my-input'))
  ```
2. Process and combine these changing values using [simple functions](#expressions),
  ```js
  const chars = $ => $(input).length
  ```
3. [Observe](#observation) these changing values and react to them
   (or [iterate](#iteration) over them),
  ```js
  const obs = observe($ => console.log($(timer) + ' : ' + $(chars)))
  ```  
4. [Clean up](#cleanup) the sources, releasing resources (e.g. stop a timer, remove an event listener, cloe a socket, etc.).
  ```js
  obs.stop()
  timer.stop()
  ```

<br>

## Sources

📝 Create a subject (whose value you can manually set at any time):
```js
import { Subject } from 'quel'

const a = new Subject()
a.set(2)
```
🕑 Create a timer:
```js
import { Timer } from 'quel'

const timer = new Timer(1000)
```
⌨️ Create an event source:
```js
import { from } from 'quel'

const click = from(document.querySelector('button'))
const hover = from(document.querySelector('button'), 'hover')
const input = from(document.querySelector('input'))
```
👀 Read latest value of a source:
```js
src.get()
```
✋ Stop a source:
```js
src.stop()
```
💁‍♂️ Wait for a source to be stopped:
```js
await src.stops()
```

<br>

> In runtimes supporting `using` keyword ([see proposal](https://github.com/tc39/proposal-explicit-resource-management)), you can
> subscribe to a source:
> ```js
> using sub = src.subscribe(value => ...)
> ```
> Currently [TypeScript 5.2](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2-beta/#using-declarations-and-explicit-resource-management) or later supports `using` keyword.

<br>

## Expressions

⛓️ Combine two sources using simple _expression_ functions:
```js
const sum = $ => $(a) + $(b)
```
🔍 Filter values:
```js
import { SKIP } from 'quel'

const odd = $ => $(a) % 2 === 0 ? SKIP : $(a)
```
🔃 Expressions can be async:
```js
const response = async $ => {
  // a debounce to avoid overwhelming the
  // server with requests.
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

🫳 Flatten higher-order sources:
```js
const variableTimer = $ => new Timer($(input))
const message = $ => 'elapsed: ' + $($(timer))
```
✋ Stop the expression:
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
> are then re-run every time a tracked source has a new value. Make sure you track the same sources everytime
> the expression runs.
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

🚀 Run side effects:
```js
import { observe } from 'quel'

observe($ => console.log($(message)))
```

💡 Observations are sources themselves:
```js
const y = observe($ => $(x) * 2)
console.log(y.get())
```

✋ Don't forget to stop observations:

```js
const obs = observe($ => ...)
obs.stop()
```

<br>

> In runtimes supporting `using` keyword ([see proposal](https://github.com/tc39/proposal-explicit-resource-management)), you don't need to manually stop observations:
> ```js
> using obs = observe($ => ...)
> ```
> Currently [TypeScript 5.2](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2-beta/#using-declarations-and-explicit-resource-management) or later supports `using` keyword.

<br>

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

## Cleanup

🧹 You need to manually clean up sources you create:

```js
const timer = new Timer(1000)

// ... whatever ...

timer.stop()
```

✨ Observations cleanup automatically when all their tracked sources
stop. YOU DONT NEED TO CLEANUP OBSERVATIONS.

If you want to stop an observation earlier, call `stop()` on it:

```js
const obs = observe($ => $(src))

// ... whatever ...

obs.stop()
```

<br>

> In runtimes supporting `using` keyword ([see proposal](https://github.com/tc39/proposal-explicit-resource-management)), you can safely
> create sources without manually cleaning them up:
> ```js
> using timer = new Timer(1000)
> ```
> Currently [TypeScript 5.2](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2-beta/#using-declarations-and-explicit-resource-management) or later supports `using` keyword.


<br>

## Typing

TypeScript wouldn't be able to infer proper types for expressions. To resolve this issue, use `Track` type:

```ts
import { Track } from 'quel'

const expr = ($: Track) => $(a) * 2
```

👉 [Check this](src/types.ts) for more useful types.

<br>

## Custom Sources

Create your own sources using `Source` class:

```js
const src = new Source(async emit => {
  await sleep(1000)
  emit('Hellow World!')
})
```

If cleanup is needed, and your producer is sync, return a cleanup function:
```js
const myTimer = new Source(emit => {
  let i = 0
  const interval = setInterval(() => emit(++i), 1000)
  
  // 👇 clear the interval when the source is stopped
  return () => clearInterval(interval)
})
```

If your producer is async, register the cleanup using `finalize` callback:
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

You can also extend the `Source` class:

```js
class MyTimer extends Source {
  constructor(rate = 200) {
    super()
    this.rate = rate
    this.count = 0
  }
  
  toggle() {
    if (this.interval) {
      this.interval = clearInterval(this.interval)
    } else {
      this.interval = setInterval(
        // call this.emit() to emit values
        () => this.emit(++this.count),
        this.rate
      )
    }
  }
  
  // override stop() to clean up
  stop() {
    clearInterval(this.interval)
    super.stop()
  }
}
```

<div align="right">

[**▷ TRY IT**](https://codepen.io/lorean_victor/pen/WNPdBdx?editors=0011)

</div>

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
// batch emissions
async $ => (await Promise.resolve(), $(src))
```
```js
// batch with animation frames
async $ => {
  await Promise(resolve => requestAnimationFrame(resolve))
  return $(src)
}
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

<div align="center">
<img src="chameleon.png" width="256px" />
</div>

<br><br>
