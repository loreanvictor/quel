import { EventSource } from './event'
import { InputSource } from './input'


export function from(input: HTMLInputElement): InputSource
export function from(node: EventTarget): EventSource<'click'>
export function from<EventName extends keyof HTMLElementEventMap>(node: EventTarget, name: EventName, options?: boolean | AddEventListenerOptions): EventSource<EventName>
export function from<EventName extends keyof HTMLElementEventMap>(
  node: EventTarget,
  name: EventName = 'click' as EventName,
  options?: boolean | AddEventListenerOptions,
): InputSource | EventSource<EventName> {
  if ((node as any).tagName && (
    (node as any).tagName === 'INPUT' || (node as any).tagName === 'TEXTAREA'
  )) {
    return new InputSource(node as HTMLInputElement)
  } else {
    return new EventSource(node, name, options)
  }
}
