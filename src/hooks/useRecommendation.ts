import { useMemo } from 'react';
import type { Content, WatchOrder, OrderType } from '@/types';
import { useWatchStore } from '@/store/watchStore';

interface RecommendationResult {
  nextItem: Content | null;
  reason: string;
}

// Human-readable watch style labels for contextual reasons
const orderTypeLabels: Record<string, string> = {
  release: 'Release Order',
  chronological: 'Chronological Order',
  recommended: 'Recommended Order',
};

export function useRecommendation(
  watchOrders: WatchOrder[],
  orderType: OrderType
): RecommendationResult {
  const { isWatched } = useWatchStore();

  return useMemo(() => {
    const orderedItems = watchOrders
      .filter((wo) => wo.order_type === orderType && wo.content)
      .sort((a, b) => a.position - b.position);

    if (orderedItems.length === 0) {
      return { nextItem: null, reason: 'No items in this watch order.' };
    }

    // Find the first unwatched item
    const nextUnwatched = orderedItems.find(
      (wo) => wo.content && !isWatched(wo.content_id)
    );

    if (!nextUnwatched?.content) {
      return { nextItem: null, reason: 'You\'ve watched everything! 🎉' };
    }

    // Build contextual reasoning
    const reason = buildReason(orderedItems, nextUnwatched, orderType, isWatched);

    return { nextItem: nextUnwatched.content, reason };
  }, [watchOrders, orderType, isWatched]);
}

/**
 * Generates a human-readable "why" explanation for the recommendation.
 */
function buildReason(
  orderedItems: WatchOrder[],
  nextUnwatched: WatchOrder,
  orderType: OrderType,
  isWatched: (id: string) => boolean
): string {
  const currentIndex = orderedItems.findIndex(
    (wo) => wo.content_id === nextUnwatched.content_id
  );
  const lastWatched = currentIndex > 0 ? orderedItems[currentIndex - 1]?.content : null;
  const styleName = orderTypeLabels[orderType] || 'your order';

  // Check if user has skipped any items before this one
  const skippedItems = orderedItems
    .slice(0, currentIndex)
    .filter((wo) => wo.content && !isWatched(wo.content_id));

  // Priority 1: First item — nothing watched yet
  if (currentIndex === 0) {
    return `Start your journey here in ${styleName}!`;
  }

  // Priority 2: User skipped some items
  if (skippedItems.length > 0 && skippedItems.length <= 3) {
    const skippedTitles = skippedItems
      .map((s) => s.content?.title)
      .filter(Boolean)
      .join(', ');
    const isOptional = skippedItems.every((s) => !s.content?.is_required);
    if (isOptional) {
      return `You skipped ${skippedTitles} — ${skippedItems.length === 1 ? "it's" : "they're"} optional.`;
    }
    return `Continuing ${styleName} — you skipped ${skippedItems.length} title${skippedItems.length > 1 ? 's' : ''}.`;
  }

  // Priority 3: Sequential continuation with context
  if (lastWatched) {
    if (orderType === 'chronological') {
      return `Follows chronologically after "${lastWatched.title}".`;
    }
    if (orderType === 'recommended') {
      return `Because you're following the ${styleName}.`;
    }
    return `Continue after "${lastWatched.title}".`;
  }

  // Fallback
  return `Next in your ${styleName}.`;
}

/**
 * Standalone function for use outside React components.
 * Returns the next recommended item for a franchise + watch style.
 */
export function getNextForFranchise(
  watchOrders: WatchOrder[],
  orderType: OrderType,
  watchedIds: Set<string>
): RecommendationResult {
  const orderedItems = watchOrders
    .filter((wo) => wo.order_type === orderType && wo.content)
    .sort((a, b) => a.position - b.position);

  if (orderedItems.length === 0) {
    return { nextItem: null, reason: 'No items in this watch order.' };
  }

  const nextUnwatched = orderedItems.find(
    (wo) => wo.content && !watchedIds.has(wo.content_id)
  );

  if (!nextUnwatched?.content) {
    return { nextItem: null, reason: 'You\'ve watched everything! 🎉' };
  }

  const isWatched = (id: string) => watchedIds.has(id);
  const reason = buildReason(orderedItems, nextUnwatched, orderType, isWatched);

  return { nextItem: nextUnwatched.content, reason };
}
