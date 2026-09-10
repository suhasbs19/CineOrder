import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const globalProc = (globalThis as any).process;
  if (globalProc && globalProc.env && globalProc.env[key]) {
    return globalProc.env[key] as string;
  }
  return defaultValue;
};

const supabaseUrl = getEnvVar(
  'VITE_SUPABASE_URL',
  getEnvVar('SUPABASE_URL', 'https://iknxldrylfsuphaydamr.supabase.co')
);
const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  getEnvVar(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbnhsZHJ5bGZzdXBoYXlkYW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDY1NTAsImV4cCI6MjEwMDgyMjU1MH0.Dw-QBxAYHyOxF9PpWLBhQx_IqZ3T5biEfus0_40sEO4'
  )
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HealthCheckResult {
  ok: boolean;
  status: number;
}

/**
 * Validates connectivity to Supabase using a minimal, read-only query.
 * 
 * 1. Checks public.franchises (primary table in schema.sql with public read access).
 * 2. If table is not yet migrated in the target DB (PGRST205), falls back to verifying
 *    Supabase service health via /auth/v1/health.
 * 
 * Strictly read-only: No artificial traffic, zero mutations, zero sensitive data exposed.
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  try {
    // 1. Primary check: Query indexed ID from core franchises table
    const { error, status } = await supabase
      .from('franchises')
      .select('id')
      .limit(1);

    if (!error && status >= 200 && status < 300) {
      return { ok: true, status: 200 };
    }

    if (error && (error.code === 'PGRST205' || status === 404)) {
      const authHealthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (authHealthRes.ok) {
        return { ok: true, status: 200 };
      }
    }

    // Log failure concisely without leaking any secrets, tokens, or credentials
    const safeError = error?.message || `Database returned status ${status}`;
    console.error('[Health Check] Supabase connectivity check failed:', safeError);
    return { ok: false, status: 503 };
  } catch (err: any) {
    console.error('[Health Check] Supabase connectivity exception:', err?.message || 'Connection error');
    return { ok: false, status: 503 };
  }
}

/**
 * Validates request authorization when CRON_SECRET is configured.
 */
export function validateCronAuth(authHeader: string | undefined | null): boolean {
  const globalProc = (globalThis as any).process;
  const cronSecret = globalProc?.env?.CRON_SECRET;
  
  // If CRON_SECRET is not configured (e.g. local dev / preview), allow request
  if (!cronSecret) {
    return true;
  }
  
  if (!authHeader) {
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Production-grade health check handler for Vercel Cron and monitoring.
 * Supports both Node.js (req, res) and Web standard Request/Response environments.
 */
export default async function handler(req: any, res?: any) {
  const isWebStandard = typeof Request !== 'undefined' && req instanceof Request;

  const sendResponse = (statusCode: number, data: any, extraHeaders?: Record<string, string>) => {
    const jsonStr = JSON.stringify(data);
    if (isWebStandard) {
      return new Response(jsonStr, {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          ...(extraHeaders || {}),
        },
      });
    }

    if (extraHeaders) {
      for (const [k, v] of Object.entries(extraHeaders)) {
        res.setHeader(k, v);
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (typeof res.status === 'function') {
      res.status(statusCode);
      if (typeof res.json === 'function') {
        return res.json(data);
      }
      if (typeof res.send === 'function') {
        return res.send(jsonStr);
      }
    }

    res.statusCode = statusCode;
    res.end(jsonStr);
    return;
  };

  const method = isWebStandard ? req.method : req?.method;
  if (method !== 'GET' && method !== 'HEAD') {
    return sendResponse(405, { status: 'error' }, { Allow: 'GET, HEAD' });
  }

  const authHeader = isWebStandard
    ? req.headers.get('authorization')
    : (req?.headers?.['authorization'] || req?.headers?.['Authorization']);

  if (!validateCronAuth(authHeader)) {
    return sendResponse(401, { status: 'unauthorized' });
  }

  const health = await checkSupabaseHealth();
  return sendResponse(health.ok ? 200 : 503, { status: health.ok ? 'ok' : 'error' });
}
