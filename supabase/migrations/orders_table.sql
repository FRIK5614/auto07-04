
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  carId TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerEmail TEXT,
  status TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL,
  message TEXT
);

-- Создаем политики Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать
CREATE POLICY orders_select_policy
  ON orders
  FOR SELECT
  USING (true);

-- Политика для вставки - все могут вставлять
CREATE POLICY orders_insert_policy
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Политика для обновления - только администраторы
CREATE POLICY orders_update_policy
  ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Политика для удаления - только администраторы
CREATE POLICY orders_delete_policy
  ON orders
  FOR DELETE
  USING (auth.role() = 'authenticated');
