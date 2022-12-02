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

const span$ = document.querySelector('span')
const a = from(document.querySelector('#a'))
const b = from(document.querySelector('#b'))

observe($ => {
  const sum = parseInt($(a) ?? 0) + parseInt($(b) ?? 0)
  span$.textContent = sum
})
```
[👉 Try it out!](https://stackblitz.com/edit/js-jh6zt2?file=index.html,index.js)
