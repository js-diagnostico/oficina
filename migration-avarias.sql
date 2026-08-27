-- Rode este script UMA VEZ no SQL Editor do Supabase, se seu projeto já existia
-- antes desta atualização (adiciona a coluna do diagrama de avarias do veículo).
-- Se você está criando o projeto do zero, não precisa rodar isso — já está no schema.sql.

alter table ordens_servico add column if not exists avarias jsonb not null default '[]';
