import { from, observe } from '../src'


const a$ = document.getElementById('a')
const b$ = document.getElementById('b')
const res$ = document.getElementById('res')

const ainput = from(a$)
const binput = from(b$)

observe($ => {
  const a = parseInt($(ainput) ?? 0)
  const b = parseInt($(binput) ?? 0)
  res$.innerHTML = a + b
})
