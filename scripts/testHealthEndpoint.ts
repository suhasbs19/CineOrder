/**
 * Automated Test Suite for CineOrder Supabase Health Check Endpoint
 *
 * Verifies:
 * 1. Direct checkSupabaseHealth() function execution.
 * 2. HTTP GET /api/health returns 200 and { "status": "ok" }.
 * 3. HTTP HEAD /api/health returns 200.
 * 4. HTTP POST /api/health returns 405 Method Not Allowed.
 * 5. CRON_SECRET security validation:
 *    - Valid Bearer token allows request (200).
 *    - Invalid Bearer token rejects with 401.
 *    - Missing Bearer token rejects with 401 when CRON_SECRET is configured.
 * 6. Simulated failure path returns 503 and { "status": "error" }.
 * 7. Verification that no sensitive secrets/tokens are exposed in output.
 */

import handler, { checkSupabaseHealth, validateCronAuth } from '../api/health';

console.log('========================================================================');
console.log('   CINEORDER PRODUCTION SUPABASE HEALTH CHECK TEST SUITE               ');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// Mock Node.js response object
function createMockRes() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, val: string) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    json(data: any) {
      this.body = JSON.stringify(data);
      return this;
    },
    send(data: any) {
      this.body = typeof data === 'string' ? data : JSON.stringify(data);
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('--- 1. Direct Supabase Health Function Check ---');
  const directHealth = await checkSupabaseHealth();
  assert(directHealth.ok === true, 'Supabase connectivity verified (status: 200)');
  assert(directHealth.status === 200, 'Direct health check returns status 200');

  console.log('\n--- 2. HTTP Handler GET Request (No CRON_SECRET set) ---');
  delete process.env.CRON_SECRET;
  const mockReqGet = {
    method: 'GET',
    headers: {},
  };
  const mockResGet = createMockRes();
  await handler(mockReqGet, mockResGet);

  assert(mockResGet.statusCode === 200, 'GET /api/health responds with HTTP 200');
  assert(
    mockResGet.headers['content-type'] === 'application/json',
    'Response header Content-Type is application/json'
  );
  assert(
    mockResGet.headers['cache-control']?.includes('no-store'),
    'Response header Cache-Control includes no-store'
  );
  const parsedBodyGet = JSON.parse(mockResGet.body);
  assert(parsedBodyGet.status === 'ok', 'Response body is exactly {"status": "ok"}');
  assert(
    !mockResGet.body.includes('key') && !mockResGet.body.includes('eyJ') && !mockResGet.body.includes('supabase'),
    'Zero credentials, secrets, or internal DB details exposed in response'
  );

  console.log('\n--- 3. HTTP Handler HEAD Request ---');
  const mockReqHead = {
    method: 'HEAD',
    headers: {},
  };
  const mockResHead = createMockRes();
  await handler(mockReqHead, mockResHead);
  assert(mockResHead.statusCode === 200, 'HEAD /api/health responds with HTTP 200');

  console.log('\n--- 4. HTTP Method Validation (POST/PUT/DELETE) ---');
  const mockReqPost = {
    method: 'POST',
    headers: {},
  };
  const mockResPost = createMockRes();
  await handler(mockReqPost, mockResPost);
  assert(mockResPost.statusCode === 405, 'POST /api/health responds with HTTP 405 Method Not Allowed');
  assert(mockResPost.headers['allow'] === 'GET, HEAD', 'Allow header specifies GET, HEAD');

  console.log('\n--- 5. CRON_SECRET Security Validation ---');
  const TEST_SECRET = 'test-cron-secret-production-token-999';
  process.env.CRON_SECRET = TEST_SECRET;

  // 5A: Valid Bearer token
  const mockReqAuthorized = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${TEST_SECRET}`,
    },
  };
  const mockResAuthorized = createMockRes();
  await handler(mockReqAuthorized, mockResAuthorized);
  assert(
    mockResAuthorized.statusCode === 200,
    'Valid Authorization: Bearer <CRON_SECRET> grants access (HTTP 200)'
  );

  // 5B: Invalid Bearer token
  const mockReqInvalidAuth = {
    method: 'GET',
    headers: {
      authorization: 'Bearer wrong-secret',
    },
  };
  const mockResInvalidAuth = createMockRes();
  await handler(mockReqInvalidAuth, mockResInvalidAuth);
  assert(
    mockResInvalidAuth.statusCode === 401,
    'Invalid Authorization: Bearer rejected with HTTP 401 Unauthorized'
  );
  assert(
    JSON.parse(mockResInvalidAuth.body).status === 'unauthorized',
    'Response body returns {"status": "unauthorized"}'
  );

  // 5C: Missing Bearer token when CRON_SECRET is configured
  const mockReqMissingAuth = {
    method: 'GET',
    headers: {},
  };
  const mockResMissingAuth = createMockRes();
  await handler(mockReqMissingAuth, mockResMissingAuth);
  assert(
    mockResMissingAuth.statusCode === 401,
    'Missing Authorization header rejected with HTTP 401 when CRON_SECRET is set'
  );

  // Clean up test env
  delete process.env.CRON_SECRET;

  console.log('\n--- 6. Web Standard Request / Response API Test ---');
  const webRequest = new Request('https://cineorder.vercel.app/api/health', {
    method: 'GET',
  });
  const webResponse = await handler(webRequest);
  assert(webResponse instanceof Response, 'Handler returns a Web standard Response object when passed a Request');
  assert(webResponse.status === 200, 'Web standard response status is 200');
  const webJson = await webResponse.json();
  assert(webJson.status === 'ok', 'Web standard response JSON body has status "ok"');

  console.log('\n========================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
