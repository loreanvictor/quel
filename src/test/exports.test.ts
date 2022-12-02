import { Source, Signal, Timer, Subject, noop, observe } from '../'


test('exports stuff.', () => {
  expect(Source).toBeDefined()
  expect(Signal).toBeDefined()
  expect(Timer).toBeDefined()
  expect(Subject).toBeDefined()
  expect(noop).toBeDefined()
  expect(observe).toBeDefined()
})
