import { POLICY_V6_2 } from './v6_2';
import type { RecommendationPolicy } from './types';

export * from './types';
export { POLICY_V5 } from './v5';
export { POLICY_V6 } from './v6';
export { POLICY_V6_1 } from './v6_1';
export { POLICY_V6_2 } from './v6_2';

export const ACTIVE_POLICY: RecommendationPolicy = POLICY_V6_2;
export const ACTIVE_POLICY_VERSION: string = POLICY_V6_2.version;
