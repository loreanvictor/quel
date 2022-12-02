# quel

_Imperative reactive programming in JavaScript._

[![tests](https://github.com/loreanvictor/quel/actions/workflows/test.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/test.yml)
[![coverage](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml)
[![version](https://img.shields.io/npm/v/quel?logo=npm)](https://www.npmjs.com/package/quel)

```bash
npm i quel
```

<br>

## What is this?

[**quel**](.) allows you to handle hot listenables (user events, web sockets, timers, etc) in an imperative and efficient way:

```js
import { from, observe } from 'quel'


const div$ = document.querySelector('div')

// creates a listenable source from given HTML input
const input = from(document.querySelector('textarea'))

// calculates number of chars from `input` source
const chars = $ => $(input)?.length ?? 0

// calculates number of words from `input` source
const words = $ => $(input)?.split(' ').length ?? 0

// displays these calculated numbers
observe($ => div$.textContent = `${$(chars)} chars, ${$(words)} words`)
```
[👉 Try it out!](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)

<br>

A more interesting example:

```js
import { from, observe, Timer } from 'quel'


const div$ = document.querySelector('div')
const input = from(document.querySelector('input'))

//
// whenever the user input changes, we want to reset
// the timer and start it with the rate user has specified.
//
const timer = async $ => {

  // read the rate from user input
  const rate = parseInt($(input) ?? 100)
  
  // but also, wait a bit until the user
  // settles on the rate they want to specify.
  // this basically debounces user input.
  await sleep(200)

  // return a new timer, which is a listenable source itself
  return new Timer(rate)
}

// displays the value of the timer
observe($ => {

  // `timer` is a higher-level source.
  // this chain application of `$` flattens it.
  const elapsed = $($(timer)) ?? '-'
  div$.textContent = `elapsed: ${elapsed}`
})
```
[👉 Try it out!](https://stackblitz.com/edit/js-4wppcl?file=index.js)

<br>

## Why?

⚡ [**quel**](.) has a minimal API surface, allowing you to do complex stuff intuitively and imperatively:

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
<br>

⚡ [**quel**](.) is imperative (unlike likes of [RxJS](https://rxjs.dev), which are functional):

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

⚡ [**quel**](.) is also faster than [RxJS](https://rxjs.dev) (which isn't that important), and noticeably lighter on memory usage (which is actually important).

<br>

> ⚠️⚠️ **WARNING** ⚠️⚠️
>
> All that said, [**quel**](.) is an experimental tool. I have merely built it to see whether I can create a fully imperative API for reactive programming without sacrificing _much_ performance (yes you can). For example, it doesn't have any error handling code (for sake of simplicity), which might become problematic in larger projects. Also it is not battle-tested for production use at all.

<br><br>
