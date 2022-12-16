import { from, observe, Timer, SKIP } from '../src'
import sleep from 'sleep-promise'

const div$ = document.querySelector('div')
const input = from(document.querySelector('input'))
const rate = $ =>  parseInt($(input) ?? 200)

const timer = async $ => {
  await sleep(200)

  return $(rate) ? new Timer($(rate)) : SKIP
}

observe($ => {
  const elapsed = $($(timer)) ?? '-'
  div$.textContent = `elapsed: ${elapsed}`
})
