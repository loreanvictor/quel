<br>

<img src="misc/dark.svg#gh-dark-mode-only" height="96px"/>
<img src="misc/light.svg#gh-light-mode-only" height="96px"/>

[![tests](https://github.com/loreanvictor/quel/actions/workflows/test.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/test.yml)
[![coverage](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml)
[![version](https://img.shields.io/npm/v/quel?logo=npm)](https://www.npmjs.com/package/quel)
![types](https://img.shields.io/npm/types/quel)

_Imperative Reactive Programming for JavaScript_

```bash
npm i quel
```
> ⚠️ **EXPERIMENTAL**, not for use on production


<br>

Most applications written in JavaScript require some degree of [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). This is either achieved via domain-specific frameworks (such as [React](https://reactjs.org)) or general-purpose libraries like [RxJS](https://rxjs.dev), which are centered around a [functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming) paradigm.

[**quel**](.) is a general-purpose library for reactive programming with an imperative style, resulting in code more in line with most other JavaScript code, and easier to read,write, understand and maintain. 

```js
import { from, observe } from 'quel'


const div$ = document.querySelector('div')

// 👇 this is an event source
const input = from(document.querySelector('textarea'))

// 👇 these are computed values based on that source
const chars = $ => $(input)?.length ?? 0
const words = $ => $(input)?.split(' ').length ?? 0

// 👇 this is a side effect executed when the computed values change
observe($ => div$.textContent = `${$(chars)} chars, ${$(words)} words`)
```
[👉 Try it out!](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)

<br>

A more involved example:

```js
//
// this code creates a timer whose rate changes
// based on values from an input.
//

import { from, observe, Timer } from 'quel'


const div$ = document.querySelector('div')
const input = from(document.querySelector('input'))

const timer = async $ => {
  const rate = parseInt($(input) ?? 100)
  await sleep(200)

  // 👇 a timer is a source itself, we have a higher-level event source here!
  return new Timer(rate)
}

observe($ => {
  const elapsed = $($(timer)) ?? '-'
  div$.textContent = `elapsed: ${elapsed}`
})
```
[👉 Try it out!](https://stackblitz.com/edit/js-4wppcl?file=index.js)

<br>

# Walkthrough

Create a subject:
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

<br>

Combine two sources:
```js
const sum = $ => $(a) + $(b)
```
Filter values
```js
import { SKIP } from 'quel'

const odd = $ => $(a) % 2 === 0 ? SKIP : $(a)
```
Do async operations:
```js
const response = async $ => {
  const query = $(input)
  await sleep(200)
  
  const res = await fetch(`https://my.api/q?=${query}`)
  const json = await res.json()
  
  return res
}
```
Flatten higher-order sources:
```js
const variableTimer = $ => new Timer($(input))
const message = $ => 'elapsed: ' + $($(timer))
```
Run side effects:
```js
import { observe } from 'quel'

observe($ => console.log($(message)))
```

<br>

Cleanup:
```js
const timer = new Timer(1000)
const effect = observe($ => console.log($(timer)))

// 👇 this just stops the side-effect, the timer keeps going ...
effect.stop()

// 👇 this stops the timer. you don't need to stop the effect manually.
timer.stop()
```

<br>

# Features

⚡ [**quel**](.) has a minimal API surface (the whole package [is ~1.1KB](https://bundlephobia.com/package/quel@0.1.5)), and relies on composability instead of providng tons of operators / helper methods:

```js
// combine two sources:
const combined = $ => $(a) + $(b)
```
```js
// debounce:
const debounced = (src, ms) => async $ => {
  const val = $(src)
  await sleep(ms)
  
  return val
}
```
```js
// flatten (e.g. switchMap):
const flatten = src => $ => $($(src))
```
```js
// merge sources
const merge = (...sources) => new Source(emit => {
  const obs = sources.map(src => observe($ => emit($(src))))

  return () => obs.forEach(ob => ob.stop())
})
```
```js
// filter a source
const filtered = $ => $(src) % 2 === 0 ? $(src) : SKIP
```
```js
// throttle
const throttled = (src, ms) => {
  let timeout = null
  
  return $ => {
    const value = $(src)
    if (timeout === null) {
      timeout = setTimeout(() => timeout = null, ms)
      return val
    } else {
      return SKIP
    }
  }
}
```

<br>

⚡ [**quel**](.) is imperative (unlike most other general-purpose reactive programming libraries such as [RxJS](https://rxjs.dev), which are functional), resulting in code that is easier to read, write and debug:

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

⚡ [**quel**](.) is as fast as [RxJS](https://rxjs.dev), noticeably faster in cases. Note that in most cases performance is not the primary concern when conducting reactive programming (since you are handling async events). If performance is critical for your use case, I'd recommend using likes of [xstream](http://staltz.github.io/xstream/) or [streamlets](https://github.com/loreanvictor/streamlet), as the imperative style of [**quel**](.) does tax a performance penalty inevitably compared to the fastest possible implementation.

<br><br>
