-- ============================================================
-- LogiTrack - Consultas SQL (Parte C do desafio)
-- Banco: data/logitrack.db (SQLite)
-- ============================================================

-- ============================================================
-- 1. Quantidade de embarques por status
-- Agrupa os embarques por status e ordena do maior para o menor.
-- Útil para verificar a distribuição inicial da massa de dados.

SELECT 
  status,
  COUNT(*) AS total
FROM shipments
GROUP BY status
ORDER BY total DESC;

-- ============================================================
-- 2. Total de embarques e valor USD por cliente (ordenado)
-- Agrupa por cliente, conta embarques e soma o valor em USD.
-- Ordenado do maior valor total para o menor.
-- ============================================================
-- 2. Por cliente: total de embarques e valor total em USD (ordenado do maior para o menor)
SELECT 
  customer,
  COUNT(*) AS total_embarques,
  ROUND(SUM(value_usd), 2) AS valor_total_usd
FROM shipments
GROUP BY customer
ORDER BY valor_total_usd DESC;

-- ============================================================
-- 3. Histórico inconsistente com o status atual
-- Retorna embarques cujo último evento (shipment_events) não
-- corresponde ao status atual da tabela shipments.
-- Usa ROW_NUMBER para pegar o evento mais recente por embarque.
-- ============================================================
-- 3. Embarques cujo histórico (shipment_events) é inconsistente com o status atual
--    (último evento não corresponde ao status atual do embarque)
SELECT 
  s.id,
  s.reference,
  s.status AS status_atual,
  e.to_status AS ultimo_evento_status,
  e.at AS data_ultimo_evento
FROM shipments s
LEFT JOIN (
  SELECT 
    shipment_id,
    to_status,
    at,
    ROW_NUMBER() OVER (PARTITION BY shipment_id ORDER BY at DESC) AS rn
  FROM shipment_events
) e ON e.shipment_id = s.id AND e.rn = 1
WHERE e.to_status IS NULL OR e.to_status <> s.status;

-- ============================================================
-- 4. Violações de regras de negócio
-- ============================================================
-- 4.1 Origem igual ao destino (case-insensitive)
SELECT id, reference, origin, destination, status
FROM shipments
WHERE LOWER(origin) = LOWER(destination);

-- 4.2 Peso inválido (<= 0 ou > 30000)
SELECT id, reference, weight_kg, status
FROM shipments
WHERE weight_kg <= 0 OR weight_kg > 30000;

-- 4.3 Valor inválido (<= 0 ou > 10000000)
SELECT id, reference, value_usd, status
FROM shipments
WHERE value_usd <= 0 OR value_usd > 10000000;

-- 4.4 Referência fora do padrão LT-AAAA-NNNN
SELECT id, reference, status
FROM shipments
WHERE reference NOT GLOB 'LT-[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]';

-- 4.5 Incoterm inválido
SELECT id, reference, incoterm, status
FROM shipments
WHERE incoterm NOT IN ('FOB', 'CIF', 'EXW', 'DAP', 'DDP');

-- ============================================================
-- 5. Validação cruzada (comparar com resposta da API)
-- Conta quantos embarques CREATED existem na base.
-- Usado para cruzar com o total retornado pela API no teste automatizado.
-- ============================================================
-- 5. Exemplo de validação cruzada (usado em teste automatizado)
--    Conta quantos embarques CREATED existem (comparar com resposta da API)
SELECT COUNT(*) AS total_created
FROM shipments
WHERE status = 'CREATED';
