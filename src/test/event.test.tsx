/** @jsx renderer.create */
/** @jsxFrag renderer.fragment */

import { testRender } from 'test-callbag-jsx'
import { EventSource } from '../event'


describe(EventSource, () => {
  test('captures events.', () => {
    testRender((renderer, {render, $}) => {
      render(<button/>)
      const src = new EventSource($('button').resolveOne()!, 'click')
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('button').click()
      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  test('stops listening.', () => {
    testRender((renderer, {render, $}) => {
      render(<button/>)
      const src = new EventSource($('button').resolveOne()!, 'click')
      const cb = jest.fn()

      src.get(cb)
      $('button').click()
      expect(cb).toHaveBeenCalledTimes(1)

      src.stop()
      $('button').click()
      expect(cb).toHaveBeenCalledTimes(1)
    })
  })
})
