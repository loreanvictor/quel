(Symbol as any).dispose ??= Symbol('dispose')


export function dispose(target: Disposable) {
  if (target && typeof target[Symbol.dispose] === 'function') {
    target[Symbol.dispose]()
  }
}


export function disposable(fn: () => void): Disposable {
  return {
    [Symbol.dispose]: fn
  }
}
