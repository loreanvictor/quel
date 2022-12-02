/** @jsx renderer.create */
/** @jsxFrag renderer.fragment */

import { testRender } from 'test-callbag-jsx'
import { InputSource } from '../input'


describe(InputSource, () => {
  test('emits input values.', () => {
    testRender((renderer, {render, $}) => {
      render(<input type='text'/>)
      const src = new InputSource($('input').resolveOne()! as HTMLInputElement)
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('input').type('foo')
      expect(cb).toHaveBeenCalledWith('f')
      expect(cb).toHaveBeenCalledWith('fo')
      expect(cb).toHaveBeenCalledWith('foo')
    })
  })

  test('stops listening', () => {
    testRender((renderer, {render, $}) => {
      render(<input type='text'/>)
      const src = new InputSource($('input').resolveOne()! as HTMLInputElement)
      const cb = jest.fn()

      src.get(cb)

      expect(cb).not.toHaveBeenCalled()

      $('input').type('foo')
      expect(cb).toHaveBeenCalledWith('f')
      expect(cb).toHaveBeenCalledWith('fo')
      expect(cb).toHaveBeenCalledWith('foo')

      cb.mockReset()
      src.stop()

      $('input').type('bar')
      expect(cb).not.toHaveBeenCalled()
    })
  })
})
