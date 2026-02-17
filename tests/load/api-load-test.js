import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '15s', target: 50 },
    { duration: '45s', target: 200 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const getRes = http.get(`${BASE_URL}/api/products`);
  check(getRes, {
    'GET status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(0.5);
  
  const payload = JSON.stringify({ name: 'Test Product', price: 99.99 });
  const postRes = http.post(`${BASE_URL}/api/products`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(postRes, {
    'POST status 201': (r) => r.status === 201,
  }) || errorRate.add(1);
  
  sleep(0.5);
}
