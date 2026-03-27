

# Implementar os 3 itens pendentes

## 1. Conectar filtros do Discover ao banco

**Problema**: DiscoverFilters.tsx seleciona curso, período e faixa de idade, mas ao clicar "Aplicar" apenas navega de volta sem passar os filtros. A RPC `get_discover_profiles()` não aceita parâmetros de filtro.

**Solução**:
- Passar os filtros via query params na URL (`/app?course=X&period=Y&minAge=18&maxAge=25`)
- No Discover.tsx, ler os query params e filtrar os resultados client-side (mais simples que alterar a RPC)
- No DiscoverFilters.tsx, montar a URL com os filtros selecionados

**Alternativa (melhor)**: Alterar a RPC `get_discover_profiles` para aceitar parâmetros opcionais de filtro (curso, período, idade min/max). Isso é mais eficiente pois filtra no banco.

**Abordagem escolhida**: Alterar a RPC via migration + atualizar o código.

### Migration SQL
```sql
CREATE OR REPLACE FUNCTION public.get_discover_profiles(
  p_course text DEFAULT NULL,
  p_period text DEFAULT NULL,
  p_min_age integer DEFAULT NULL,
  p_max_age integer DEFAULT NULL
)
RETURNS SETOF users
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.* FROM public.users u
  WHERE u.id != auth.uid()
    AND u.is_active = true
    AND u.vacation_mode = false
    AND NOT EXISTS (
      SELECT 1 FROM public.likes l
      WHERE l.from_user_id = auth.uid() AND l.to_user_id = u.id
    )
    AND NOT public.is_blocked(auth.uid(), u.id)
    AND (p_course IS NULL OR u.course = p_course)
    AND (p_period IS NULL OR u.period = p_period)
    AND (p_min_age IS NULL OR u.age >= p_min_age)
    AND (p_max_age IS NULL OR u.age <= p_max_age)
  ORDER BY random()
  LIMIT 20;
$$;
```

### DiscoverFilters.tsx
- Na função `apply()`, navegar com query params: `navigate("/app?course=...&period=...&minAge=...&maxAge=...")`
- Omitir params quando valor é "Todos" ou default

### Discover.tsx
- Ler query params com `useSearchParams`
- Passar os parâmetros para `supabase.rpc("get_discover_profiles", { p_course, p_period, p_min_age, p_max_age })`
- Recarregar perfis quando params mudam

---

## 2. Adicionar blur nos perfis em "Quem me curtiu"

**Problema**: Todos os perfis aparecem sem blur, mesmo os que o usuário ainda não curtiu de volta.

**Solução no WhoLikedMe.tsx**:
- Buscar os likes que o usuário logado já deu (`from_user_id = user.id`) para saber quais ele já curtiu de volta
- Perfis não curtidos de volta: aplicar `blur-sm` na foto e esconder o nome parcialmente
- Perfis já curtidos (matched): mostrar normalmente

---

## 3. Deletar match ao bloquear

**Problema**: Ao bloquear no UserProfile.tsx, insere em `blocked_users` mas não deleta o match existente. A tabela `matches` não tem policy de DELETE.

**Solução**:
- Migration: adicionar RLS policy de DELETE em `matches` para participantes
- No `handleBlock` do UserProfile.tsx: após inserir em `blocked_users`, deletar matches onde o usuário bloqueado participa

### Migration SQL
```sql
CREATE POLICY "Users can delete own matches"
ON public.matches FOR DELETE TO authenticated
USING (user1_id = auth.uid() OR user2_id = auth.uid());
```

### UserProfile.tsx — handleBlock
Adicionar após o insert em `blocked_users`:
```typescript
// Delete any existing match
const myId = currentUser.id;
const u1 = myId < userId ? myId : userId;
const u2 = myId < userId ? userId : myId;
await supabase.from("matches").delete()
  .eq("user1_id", u1).eq("user2_id", u2);
```

---

## Resumo das mudanças

| Arquivo | Mudança |
|---|---|
| Migration SQL | Alterar RPC `get_discover_profiles` com params; adicionar DELETE policy em `matches` |
| `src/pages/DiscoverFilters.tsx` | Passar filtros via query params |
| `src/pages/Discover.tsx` | Ler query params, passar para RPC |
| `src/pages/WhoLikedMe.tsx` | Buscar likes do usuário, aplicar blur em não-curtidos |
| `src/pages/UserProfile.tsx` | Deletar match ao bloquear |

