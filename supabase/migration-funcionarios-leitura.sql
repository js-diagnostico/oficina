-- Corrige a permissão da tabela funcionarios: antes só o admin conseguia LER a lista,
-- o que impedia o funcionário de escolher mecânico/vendedor na Nova OS.
-- Agora qualquer usuário logado pode ler; só o admin continua podendo criar/editar/excluir.
-- Pode rodar mais de uma vez sem problema.

drop policy if exists "funcionarios_all_admin" on funcionarios;
drop policy if exists "funcionarios_select_logado" on funcionarios;
drop policy if exists "funcionarios_insert_admin" on funcionarios;
drop policy if exists "funcionarios_update_admin" on funcionarios;
drop policy if exists "funcionarios_delete_admin" on funcionarios;

create policy "funcionarios_select_logado" on funcionarios for select using (auth.uid() is not null);
create policy "funcionarios_insert_admin" on funcionarios for insert with check (is_admin());
create policy "funcionarios_update_admin" on funcionarios for update using (is_admin()) with check (is_admin());
create policy "funcionarios_delete_admin" on funcionarios for delete using (is_admin());
