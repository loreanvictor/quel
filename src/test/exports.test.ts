import { Source, Signal, Timer, Subject, EventSource, InputSource,
  noop, observe, from } from '../'


test('exports stuff.', () => {
  expect(Source).toBeDefined()
  expect(Signal).toBeDefined()
  expect(Timer).toBeDefined()
  expect(Subject).toBeDefined()
  expect(EventSource).toBeDefined()
  expect(InputSource).toBeDefined()

  expect(noop).toBeDefined()
  expect(observe).toBeDefined()
  expect(from).toBeDefined()
})
