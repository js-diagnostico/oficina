-- ============================================================
-- JS Diagnóstico — schema do banco (Supabase / Postgres)
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em "Run".
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Perfis de acesso (login do app) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel text not null default 'funcionario' check (papel in ('admin','funcionario')),
  created_at timestamptz default now()
);

-- Função auxiliar: o usuário logado é admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and papel = 'admin'
  );
$$ language sql security definer stable;

-- O primeiro usuário que se cadastrar vira admin automaticamente.
-- Os próximos que o admin cadastrar entram como 'funcionario' (o app já envia isso).
create or replace function handle_new_profile_default_role()
returns trigger as $$
begin
  if not exists (select 1 from profiles) then
    new.papel := 'admin';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_profiles_default_role
before insert on profiles
for each row execute function handle_new_profile_default_role();

-- ---------- Clientes ----------
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  documento text,
  endereco text,
  veiculos jsonb not null default '[]',
  created_at timestamptz default now()
);

-- ---------- Estoque (material automotivo) ----------
create table if not exists estoque (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  descricao text not null,
  categoria text,
  custo numeric default 0,
  preco numeric default 0,
  estoque_atual numeric default 0,
  estoque_min numeric default 0,
  created_at timestamptz default now()
);

-- ---------- Catálogo de serviços padronizados ----------
create table if not exists catalogo_servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null,
  valor_padrao numeric default 0,
  descricao text,
  created_at timestamptz default now()
);

-- ---------- Equipe (mecânicos/vendedores p/ comissão) ----------
create table if not exists funcionarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  papel text not null default 'mecanico' check (papel in ('mecanico','vendedor','ambos')),
  percentual numeric default 0,
  telefone text,
  created_at timestamptz default now()
);

-- ---------- Ordens de serviço ----------
create table if not exists ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  status text not null default 'aberta' check (status in ('aberta','andamento','concluida','cancelada')),
  cliente jsonb not null default '{}',
  veiculo jsonb not null default '{}',
  problema text,
  laudo_tecnico text,
  forma_pagamento text,
  garantia_dias text,
  nivel_combustivel text,
  checklist jsonb not null default '[]',
  avarias jsonb not null default '[]',
  servicos jsonb not null default '[]',
  pecas jsonb not null default '[]',
  observacoes text,
  mecanico_id uuid references funcionarios(id) on delete set null,
  vendedor_id uuid references funcionarios(id) on delete set null,
  data_entrada date,
  previsao date,
  desconto numeric default 0,
  data_conclusao timestamptz,
  estoque_baixado boolean default false,
  created_at timestamptz default now()
);

-- ---------- Comissões já pagas (chave = funcionarioId|AAAA-MM) ----------
create table if not exists comissoes_pagas (
  chave text primary key,
  pago boolean default true
);

-- ---------- Configuração da oficina (linha única) ----------
create table if not exists config (
  id int primary key default 1,
  nome text default 'JS Diagnóstico',
  telefone text default '',
  endereco text default '',
  garantia_padrao_dias text default '90',
  termos_garantia text default 'A garantia cobre exclusivamente o serviço e as peças fornecidas pela oficina, contra defeito de instalação ou fabricação, não cobrindo mau uso, negligência ou intervenção de terceiros.',
  constraint config_single_row check (id = 1)
);
insert into config (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- Row Level Security — só quem está logado enxerga os dados,
-- e telas administrativas (Equipe, Comissões, Config, Usuários)
-- só podem ser lidas/alteradas por quem é admin.
-- ============================================================

alter table profiles enable row level security;
alter table clientes enable row level security;
alter table estoque enable row level security;
alter table catalogo_servicos enable row level security;
alter table funcionarios enable row level security;
alter table ordens_servico enable row level security;
alter table comissoes_pagas enable row level security;
alter table config enable row level security;

-- profiles: todo usuário logado pode ver a lista (pra exibir nomes);
-- só admin pode criar/editar/excluir perfis de outras pessoas.
create policy "profiles_select_logado" on profiles for select using (auth.uid() is not null);
create policy "profiles_insert_admin" on profiles for insert with check (is_admin() or not exists (select 1 from profiles));
create policy "profiles_update_admin" on profiles for update using (is_admin());
create policy "profiles_delete_admin" on profiles for delete using (is_admin());

-- clientes, estoque, catálogo, ordens: qualquer usuário logado (admin ou funcionário) pode ler e escrever
create policy "catalogo_all_logado" on catalogo_servicos for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- funcionarios: qualquer logado pode LER (precisa pra escolher mecânico/vendedor na OS),
-- mas só admin pode criar/editar/excluir (os dados de comissão ficam protegidos)
create policy "funcionarios_select_logado" on funcionarios for select using (auth.uid() is not null);
create policy "funcionarios_insert_admin" on funcionarios for insert with check (is_admin());
create policy "funcionarios_update_admin" on funcionarios for update using (is_admin()) with check (is_admin());
create policy "funcionarios_delete_admin" on funcionarios for delete using (is_admin());

-- comissoes_pagas, config: só admin lê e altera (dados sensíveis de comissão)
create policy "comissoes_all_admin" on comissoes_pagas for all using (is_admin()) with check (is_admin());
create policy "config_select_logado" on config for select using (auth.uid() is not null);
create policy "config_update_admin" on config for update using (is_admin());

-- ============================================================
-- IMPORTANTE (fazer manualmente no painel do Supabase):
-- Authentication > Providers > Email > desative "Confirm email"
-- (assim o login funciona na hora, sem precisar de servidor de e-mail)
-- ============================================================
-- Permite ao ADMINISTRADOR excluir de verdade o login de um usuário e liberar e-mails "presos".
-- Pode rodar mais de uma vez sem problema.

-- 1) Exclui o acesso por completo (perfil + conta de login). Só admin; não deixa excluir a si mesmo.
create or replace function public.excluir_usuario(alvo uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Somente o administrador pode excluir usuários.';
  end if;
  if alvo = auth.uid() then
    raise exception 'Você não pode excluir o seu próprio acesso.';
  end if;
  delete from public.profiles where id = alvo;
  delete from auth.users where id = alvo;
end;
$$;

-- 2) Libera um e-mail que ficou preso numa conta de login SEM acesso no app (sobra de exclusões antigas).
--    Nunca apaga quem ainda tem acesso ativo. Retorna: 'liberado', 'ativo' ou 'inexistente'.
create or replace function public.liberar_email(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Somente o administrador pode fazer isso.';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then return 'inexistente'; end if;
  if exists (select 1 from public.profiles where id = v_id) then return 'ativo'; end if;
  delete from auth.users where id = v_id;
  return 'liberado';
end;
$$;

revoke all on function public.excluir_usuario(uuid) from public, anon;
revoke all on function public.liberar_email(text) from public, anon;
grant execute on function public.excluir_usuario(uuid) to authenticated;
grant execute on function public.liberar_email(text) to authenticated;

-- Exclusão só para admin (OS, clientes, estoque)
-- Só o ADMINISTRADOR pode excluir OS, clientes e itens do estoque.
-- Funcionários continuam podendo ler, criar e editar (inclusive dar baixa no estoque).
-- Pode rodar mais de uma vez sem problema.

drop policy if exists "clientes_all_logado" on clientes;
drop policy if exists "clientes_select_logado" on clientes;
drop policy if exists "clientes_insert_logado" on clientes;
drop policy if exists "clientes_update_logado" on clientes;
drop policy if exists "clientes_delete_admin" on clientes;
create policy "clientes_select_logado" on clientes for select using (auth.uid() is not null);
create policy "clientes_insert_logado" on clientes for insert with check (auth.uid() is not null);
create policy "clientes_update_logado" on clientes for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "clientes_delete_admin" on clientes for delete using (is_admin());

drop policy if exists "estoque_all_logado" on estoque;
drop policy if exists "estoque_select_logado" on estoque;
drop policy if exists "estoque_insert_logado" on estoque;
drop policy if exists "estoque_update_logado" on estoque;
drop policy if exists "estoque_delete_admin" on estoque;
create policy "estoque_select_logado" on estoque for select using (auth.uid() is not null);
create policy "estoque_insert_logado" on estoque for insert with check (auth.uid() is not null);
create policy "estoque_update_logado" on estoque for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "estoque_delete_admin" on estoque for delete using (is_admin());

drop policy if exists "ordens_all_logado" on ordens_servico;
drop policy if exists "ordens_select_logado" on ordens_servico;
drop policy if exists "ordens_insert_logado" on ordens_servico;
drop policy if exists "ordens_update_logado" on ordens_servico;
drop policy if exists "ordens_delete_admin" on ordens_servico;
create policy "ordens_select_logado" on ordens_servico for select using (auth.uid() is not null);
create policy "ordens_insert_logado" on ordens_servico for insert with check (auth.uid() is not null);
create policy "ordens_update_logado" on ordens_servico for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "ordens_delete_admin" on ordens_servico for delete using (is_admin());
