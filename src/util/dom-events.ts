/* istanbul ignore file */

export function addListener<EventName extends keyof HTMLElementEventMap>
(
  node: EventTarget,
  name: EventName,
  handler: (event: HTMLElementEventMap[EventName]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  if (node.addEventListener) {
    node.addEventListener(name, handler as any, options)
  } else if ((node as any).addListener) {
    (node as any).addListener(name, handler)
  }
}


export function removeListener<EventName extends keyof HTMLElementEventMap>
(
  node: EventTarget,
  name: EventName,
  handler: (event: HTMLElementEventMap[EventName]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  if (node.removeEventListener) {
    node.removeEventListener(name, handler as any, options)
  } else if ((node as any).removeListener) {
    (node as any).removeListener(name, handler)
  }
}
