/** @jsx renderer.create */
/** @jsxFrag renderer.fragment */

import { testRender } from 'test-callbag-jsx'
import { from } from '../from'


describe(from, () => {
  test('listens to clicks.', () => {
    testRender((renderer, {render, $}) => {
      render(<button/>)
      const src = from($('button').resolveOne()!)
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('button').click()
      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  test('listens to inputs.', () => {
    testRender((renderer, {render, $}) => {
      render(<input type='text'/>)
      const src = from($('input').resolveOne()!)
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('input').type('foo')
      expect(cb).toHaveBeenCalledWith('f')
      expect(cb).toHaveBeenCalledWith('fo')
      expect(cb).toHaveBeenCalledWith('foo')
    })
  })

  test('listens to textareas.', () => {
    testRender((renderer, {render, $}) => {
      render(<textarea/>)
      const src = from($('textarea').resolveOne()!)
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('textarea').type('foo')
      expect(cb).toHaveBeenCalledWith('f')
      expect(cb).toHaveBeenCalledWith('fo')
      expect(cb).toHaveBeenCalledWith('foo')
    })
  })

  test('listens to custom events on textareas.', () => {
    testRender((renderer, {render, $}) => {
      render(<textarea/>)
      const src = from($('textarea').resolveOne()!, 'click')
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('textarea').click()
      expect(cb).toHaveBeenCalled()
    })
  })
})
