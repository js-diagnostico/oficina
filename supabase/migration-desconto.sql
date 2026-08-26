-- Rode este script UMA VEZ no SQL Editor do Supabase, se seu projeto já existia
-- antes desta atualização (adiciona a coluna de desconto na ordem de serviço).
-- Se você está criando o projeto do zero, não precisa rodar isso — já está no schema.sql.

alter table ordens_servico add column if not exists desconto numeric default 0;
