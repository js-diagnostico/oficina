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
