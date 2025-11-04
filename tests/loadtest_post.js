// test con k6 para carga de peticiones POST al endpoint /solve

import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del test
export const options = {
  vus: 100,               // usuarios virtuales simultáneos
  duration: '60s',       // durante cto tiempo lo vamos a testear
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% de las requests < 300 ms
    http_req_failed: ['rate<0.01'],   // menos del 1% con error
  },
};

// Función para generar números aleatorios en rango
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Función para generar un vector aleatorio
function randomVector(n, min = 1, max = 10) {
  return Array.from({ length: n }, () => parseFloat(rand(min, max).toFixed(2)));
}

// Función principal de test
export default function () {
  const m = Math.floor(rand(2, 4)); // restricciones
  const n = Math.floor(rand(2, 4)); // variables

  // Generar una matriz A con valores moderados
  const A = Array.from({ length: m }, () =>
    Array.from({ length: n }, () => parseFloat(rand(1, 8).toFixed(2)))
  );

  // Generar vector b que siempre sea mayor que los posibles productos de A
  const b = Array.from({ length: m }, () => parseFloat(rand(15, 40).toFixed(2)));

  // Solo usamos restricciones <= para asegurar factibilidad
  const signs = Array.from({ length: m }, () => "<=");

  // Coeficientes de la función objetivo
  const c = randomVector(n, 2, 9);

  const payload = JSON.stringify({
    A,
    b,
    signs,
    c,
    maximize: true,
  });

  const headers = { 'Content-Type': 'application/json' };

  
  const res = http.post('http://localhost:8080/solve', payload, { headers });

  // Verificamos respuesta
  check(res, {
    'status was 200': (r) => r.status === 200,
    'body contains Optimo': (r) => r.body.includes('Optimo'),
  });

  sleep(0.5); // pequeña pausa entre requests
}
