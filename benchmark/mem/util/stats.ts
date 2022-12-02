const tTable: any = {
  '1':  12.706, '2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
  '7':  2.365,  '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
  '13': 2.16,   '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
  '19': 2.093,  '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
  '25': 2.06,   '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
  'infinity': 1.96
}

export function rme(arr: number[]) {
  const avg = average(arr)
  const variance = arr.reduce((acc, num) => acc + Math.pow(num - avg, 2), 0) / arr.length
  const sd = Math.sqrt(variance)
  const sem = sd / Math.sqrt(arr.length)
  const df = arr.length - 1
  const critical = tTable[df as any] || tTable['infinity']
  const moe = critical * sem

  return moe / avg * 100
}


export function average(arr: number[]) {
  return arr.reduce((acc, val) => acc + val) / arr.length
}
