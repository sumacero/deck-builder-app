import { useState } from 'react';

/** holding の間は、holding になる直前の値を返し続ける。holding でなければ value をそのまま返す。 */
export function useHeldWhile<T>(holding: boolean, value: T): T {
  const [held, setHeld] = useState(value);
  if (!holding && !Object.is(held, value)) setHeld(value);
  return holding ? held : value;
}
