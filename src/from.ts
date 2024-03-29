import { EventMap } from './util/dom-events'
import { EventSource } from './event'
import { InputSource } from './input'


export function from(input: HTMLInputElement): InputSource
export function from(node: EventTarget): EventSource<'click'>
export function from<EventName extends keyof EventMap>(
  node: EventTarget,
  name: EventName,
  options?: boolean | AddEventListenerOptions
): EventSource<EventName>
export function from<EventName extends keyof EventMap>(
  node: EventTarget,
  name?: EventName,
  options?: boolean | AddEventListenerOptions,
): InputSource | EventSource<EventName> {
  if (!name && (node as any).tagName && (
    (node as any).tagName === 'INPUT' || (node as any).tagName === 'TEXTAREA'
  )) {
    return new InputSource(node as HTMLInputElement)
  } else {
    return new EventSource(node, name ?? 'click' as EventName, options)
  }
}
