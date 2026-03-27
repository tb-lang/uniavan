

# Adicionar botões Curtir/Passar no UserProfile com lógica de match

## Problema
O `UserProfile.tsx` atualmente mostra apenas "Enviar mensagem" e Instagram. Não tem ações de curtir/passar. Quando o usuário clica numa notificação de curtida, vai para essa página mas não consegue curtir de volta — o fluxo esperado estilo Tinder.

## Solução

### `src/pages/UserProfile.tsx`

1. **Substituir a seção de ações** (linhas 186-205): trocar "Enviar mensagem" por dois botões — "Passar" (X) e "Curtir" (Heart) — no mesmo estilo visual do Discover
2. **Adicionar lógica de like/pass**: inserir na tabela `likes` ao clicar, verificar match (mesma lógica do Discover), e mostrar overlay de match se houver
3. **Adicionar overlay de match**: reutilizar o mesmo design do Discover ("É um match!" com botão de mensagem e "Continuar")
4. **Adicionar estado `alreadyInteracted`**: ao montar, verificar se o usuário já curtiu/passou esse perfil. Se sim, esconder os botões de ação e mostrar "Enviar mensagem" (caso já tenha match) ou nada
5. **Importar** `Heart`, `X` do lucide-react

### Fluxo completo
- Notificação de curtida → clica → abre UserProfile com botões Curtir/Passar
- Curtir → insert like → aguarda 300ms → verifica match → se match, mostra overlay
- Passar → insert dislike → navega de volta
- Se já interagiu antes, mostra interface padrão (mensagem se match, senão só perfil)

### Detalhes técnicos
- Query inicial: `supabase.from("likes").select("id").eq("from_user_id", currentUser.id).eq("to_user_id", userId).maybeSingle()` para checar interação prévia
- Query de match: mesma lógica do Discover com ordenação de IDs `u1 < u2`
- Manter "Enviar mensagem" visível apenas se já houver match entre os dois

