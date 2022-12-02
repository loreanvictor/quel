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
const input = from(document.querySelector('textarea'))

const chars = $ => $(input)?.length ?? 0
const words = $ => $(input)?.split(' ').length ?? 0

observe($ => div$.textContent = `${$(chars)} chars, ${$(words)} words`)
```
[👉 Try it out!](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)
