import { from, observe, Timer } from '../src'
import sleep from 'sleep-promise'

const div$ = document.querySelector('div')
const input = from(document.querySelector('input'))

const timer = async $ => {
  const rate = parseInt($(input) ?? 100)
  await sleep(200)

  return new Timer(rate)
}

observe($ => {
  const elapsed = $($(timer)) ?? '-'
  div$.textContent = `elapsed: ${elapsed}`
})
