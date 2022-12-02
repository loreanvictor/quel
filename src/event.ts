import { Source } from './source'
import { addListener, removeListener } from './util/dom-events'


export class EventSource<EventName extends keyof HTMLElementEventMap> extends Source<HTMLElementEventMap[EventName]> {
  constructor(
    readonly node: EventTarget,
    readonly name: EventName,
    readonly options?: boolean | AddEventListenerOptions,
  ) {
    super(emit => {
      const handler = (evt: HTMLElementEventMap[EventName]) => emit(evt)
      addListener(node, name, handler, options)

      return () => removeListener(node, name, handler, options)
    })
  }
}
