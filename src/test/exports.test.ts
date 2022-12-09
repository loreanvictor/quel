import {
  Source, Timer, Subject, EventSource, InputSource,
  noop, observe, iterate, from,
  Listener, Cleanup, Producer, SourceLike, ExprFn, Observable, Track, SKIP,
} from '../'


test('exports stuff.', () => {
  expect(Source).toBeDefined()
  expect(Timer).toBeDefined()
  expect(Subject).toBeDefined()
  expect(EventSource).toBeDefined()
  expect(InputSource).toBeDefined()

  expect(noop).toBeDefined()
  expect(observe).toBeDefined()
  expect(iterate).toBeDefined()
  expect(from).toBeDefined()

  expect(SKIP).toBeDefined()
  expect(<Listener<any>>{}).toBeDefined()
  expect(<Cleanup>{}).toBeDefined()
  expect(<Producer<any>>{}).toBeDefined()
  expect(<SourceLike<any>>{}).toBeDefined()
  expect(<ExprFn<any>>{}).toBeDefined()
  expect(<Observable<any>>{}).toBeDefined()
  expect(<Track>{}).toBeDefined()
  expect(<SourceLike<any>>{}).toBeDefined()
})
