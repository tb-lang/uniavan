

# Fix: Registro falha com erro de RLS

## Problema Identificado

O signup no Supabase Auth funciona (status 200), mas o INSERT na tabela `users` falha com status **401** porque:

1. O Supabase está com **confirmação de email habilitada** por padrão
2. Quando email confirmation está ativa, o `signUp()` **não retorna uma sessão** — o usuário precisa confirmar o email primeiro
3. O INSERT subsequente usa o **anon key** (sem `auth.uid()`), e a RLS policy `id = auth.uid()` rejeita

## Solução

Duas mudanças necessárias:

### 1. Criar trigger no banco para auto-criar perfil no signup
Em vez de depender do frontend para inserir na tabela `users`, criar um trigger que escuta `auth.users` e cria automaticamente o registro:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Atualizar Register.tsx
- Passar o `name` via `signUp` metadata: `signUp(email, password, { data: { name: form.nome } })`
- Após o signup, em vez de INSERT, fazer um UPDATE na tabela `users` para preencher os campos adicionais (course, bio, etc.)
- O UPDATE só será feito quando o usuário confirmar o email e fizer login — ou seja, mover a lógica de completar o perfil para a página de onboarding/primeiro login
- **Alternativa mais simples**: Desabilitar email confirmation no Supabase dashboard para que o signup retorne sessão imediatamente, mantendo o fluxo atual

### 3. Atualizar useAuth.ts
- Adicionar suporte a metadata no `signUp`

### 4. Bug secundário: campo `period` e `age`
- O campo `age` foi `null` porque `form.nascimento` ficou vazio (problema com input date no browser) — garantir que o cálculo de idade funciona corretamente
- O campo `period` foi `null` — verificar se o select está atualizando o form state corretamente (pode ser apenas issue do browser automation)

## Abordagem Recomendada

A forma mais simples e robusta:
1. **Desabilitar email confirmation** no Supabase dashboard (Auth → Providers → Email → desmarcar "Confirm email")
2. **Criar o trigger** como fallback de segurança
3. **Manter o fluxo atual** do Register.tsx com INSERT após signup (funcionará porque a sessão será retornada imediatamente)

## Detalhes Técnicos
- Migration SQL para criar o trigger `handle_new_user`
- Atualizar `signUp` no `useAuth.ts` para aceitar metadata opcional
- Adicionar tratamento de erro mais robusto no `handleSubmit` do Register.tsx

