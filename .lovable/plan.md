

# Habilitar badge de notificações no ícone de sino

## Problema
O BottomTabBar não mostra quantas notificações novas existem. Na página de Notificações, todas são marcadas como `read: false` por padrão (sem persistência). Não há como o sino saber quantas notificações são novas.

## Solução

Usar **localStorage** para guardar o timestamp da última vez que o usuário abriu a tela de Notificações. Qualquer like/match mais recente que esse timestamp é considerado "não lido".

### 1. Criar `src/contexts/NotificationContext.tsx`
- Context que busca a contagem de likes recebidos + matches com `created_at` maior que o `lastSeenAt` salvo no localStorage
- Expõe `unreadCount` e `markAsSeen()` (que atualiza o timestamp no localStorage)
- Usa Supabase Realtime para escutar inserts na tabela `likes` (onde `to_user_id = user.id`) e incrementar o contador em tempo real
- Refetch periódico a cada 60s como fallback

### 2. Atualizar `src/App.tsx`
- Envolver o app com `<NotificationProvider>` (dentro de `<UserProvider>`)

### 3. Atualizar `src/components/BottomTabBar.tsx`
- Importar `useNotifications()` do contexto
- No tab "Avisos" (Bell), renderizar um badge vermelho com o número quando `unreadCount > 0`

### 4. Atualizar `src/pages/Notifications.tsx`
- Chamar `markAsSeen()` ao montar a página (useEffect)
- Usar o `lastSeenAt` para determinar quais notificações são `read: true` vs `read: false`

## Resumo de arquivos

| Arquivo | Ação |
|---|---|
| `src/contexts/NotificationContext.tsx` | Criar — context com contagem e realtime |
| `src/App.tsx` | Adicionar NotificationProvider |
| `src/components/BottomTabBar.tsx` | Mostrar badge com unreadCount |
| `src/pages/Notifications.tsx` | Chamar markAsSeen + usar lastSeenAt para read state |

