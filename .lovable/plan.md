

# Fix: Remover foto padrão de mulher no Discover

## Problema
No `src/pages/Discover.tsx` (linha 31), quando o usuário não tem foto, o fallback é uma URL do Unsplash com a foto de uma mulher. Isso é enganoso.

## Solução

### `src/pages/Discover.tsx`
- Linha 31: trocar o fallback de Unsplash por `null` ou string vazia
- Quando não houver foto, exibir um placeholder neutro (ícone de câmera ou iniciais do nome sobre fundo colorido) em vez de uma foto de outra pessoa

### `src/pages/UserProfile.tsx`
- Linha 117: trocar `/placeholder.svg` por um placeholder neutro similar

### Implementação do placeholder
- Se `photos[0]` não existe, renderizar um `div` com fundo gradient (usando as cores da marca) e as iniciais do nome do usuário centralizadas, em vez de um `<img>`

