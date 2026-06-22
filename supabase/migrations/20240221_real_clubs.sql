-- Clubs réels pour le test terrain
INSERT INTO public.clubs (id, name, slug)
VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Club Nautique de Coutainville', 'cnc'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'Association Nautique de Hauteville', 'anh')
ON CONFLICT (id) DO NOTHING;
