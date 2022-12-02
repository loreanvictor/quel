# quel

```bash
npm i quel
```

[![tests](https://github.com/loreanvictor/quel/actions/workflows/test.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/test.yml)
[![coverage](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml/badge.svg)](https://github.com/loreanvictor/quel/actions/workflows/coverage.yml)
[![version](https://img.shields.io/npm/v/quel?logo=npm)](https://www.npmjs.com/package/quel)


Expression-based reactive library for hot listenables:

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

<br><br>

