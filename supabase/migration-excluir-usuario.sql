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
