import { useLiveQuery } from 'dexie-react-hooks';
import { getLineItemHistory } from '../lib/db';
import type { LineItem } from '../lib/types';

export function useLineItemHistory(): LineItem[] {
  return useLiveQuery(() => getLineItemHistory(), []) ?? [];
}
