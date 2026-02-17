import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loadTime = new Trend('load_time');

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 200 },
    { duration: '30s', target: 500 },
    { duration: '60s', target: 500 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.15'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/health`);
  const duration = Date.now() - start;
  
  loadTime.add(duration);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => duration < 1000,
  });
  
  errorRate.add(!success);
  sleep(0.5);
}
