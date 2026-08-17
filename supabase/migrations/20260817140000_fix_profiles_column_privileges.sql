-- Corrige falha de segurança: a policy de UPDATE original liberava alteração
-- de QUALQUER coluna da própria linha em public.profiles, incluindo
-- status_assinatura, asaas_customer_id e asaas_subscription_id. Isso permitia
-- que um usuário autenticado liberasse acesso ao chat sem pagar, chamando
-- diretamente supabase.from('profiles').update({ status_assinatura: 'ativo' }).
--
-- RLS (USING/WITH CHECK) não tem acesso ao valor antigo da linha dentro de um
-- UPDATE, então não dá para bloquear a alteração de uma coluna específica só
-- com WITH CHECK. A forma correta é usar privilégio de coluna (GRANT UPDATE
-- (colunas)), que o Postgres aplica antes mesmo de avaliar a RLS.

-- 1. Remove a policy antiga (liberava UPDATE em qualquer coluna da própria linha)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Recria a policy só para escopo de linha (usuário só mexe na própria linha)
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Proteção real das colunas sensíveis: privilégio de coluna.
-- authenticated só pode atualizar nome e email; status_assinatura,
-- asaas_customer_id e asaas_subscription_id ficam de fora do GRANT, então
-- qualquer tentativa de alterá-las falha com "permission denied for column".
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (nome, email) ON public.profiles TO authenticated;

-- 4. Mesmo endurecimento no INSERT, por precaução: hoje a linha em profiles
-- é sempre criada pela trigger handle_new_user (SECURITY DEFINER) antes do
-- usuário conseguir chamar qualquer coisa autenticado, mas a policy de INSERT
-- original também liberava qualquer coluna, incluindo status_assinatura.
REVOKE INSERT ON public.profiles FROM authenticated;
GRANT INSERT (id, nome, email) ON public.profiles TO authenticated;

-- service_role (usado pelo webhook do Asaas) continua com GRANT ALL,
-- concedido na migration original, e não é afetado pelos REVOKEs acima.
