import { addListener, removeListener } from './util/dom-events'
import { Source } from './source'


export class InputSource extends Source<string> {
  constructor(
    readonly node: HTMLInputElement,
  ) {
    super(emit => {
      const handler = (evt: Event) => emit((evt.target as HTMLInputElement).value)
      addListener(node, 'input', handler)

      return () => removeListener(node, 'input', handler)
    })
  }
}
