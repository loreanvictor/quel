import { Source } from './source'
import { addListener, removeListener, EventMap } from './util/dom-events'


export class EventSource<EventName extends keyof EventMap> extends Source<EventMap[EventName]> {
  constructor(
    readonly node: EventTarget,
    readonly name: EventName,
    readonly options?: boolean | AddEventListenerOptions,
  ) {
    super(emit => {
      const handler = (evt: EventMap[EventName]) => emit(evt)
      addListener(node, name, handler, options)

      return () => removeListener(node, name, handler, options)
    })
  }
}
