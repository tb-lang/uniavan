

# Fix: BottomTabBar desaparece em Avisos + badges falsos

## Problema 1 — Barra some ao clicar em "Avisos"
O array `hiddenPaths` no `BottomTabBar.tsx` inclui `"/app/notifications"`, fazendo a barra sumir nessa rota. Basta remover esse path da lista.

## Problema 2 — Badges hardcoded
Os badges de "Matches" e "Avisos" são valores fixos (`badge: 2` e `UNREAD_NOTIFS = 2`), não vêm do banco. Solução: remover os badges estáticos da definição dos tabs. Futuramente podem ser alimentados por queries reais, mas por ora devem ser removidos para não mostrar informação falsa.

## Mudanças

### `src/components/BottomTabBar.tsx`
1. Remover `"/app/notifications"` do array `hiddenPaths` (linha 19)
2. Remover `const UNREAD_NOTIFS = 2` (linha 5)
3. Remover `badge: 2` do tab Matches (linha 9)
4. Remover `badge: UNREAD_NOTIFS` do tab Avisos (linha 11)

Nenhuma outra alteração necessária.

