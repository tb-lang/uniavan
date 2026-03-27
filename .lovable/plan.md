

# Adicionar botão "Sair" na aba Perfil

## Mudança

### `src/pages/Profile.tsx`
- Importar `LogOut` do lucide-react e `useAuth` de `@/hooks/useAuth`
- Após a seção de Fotos (antes do `</div>` final do container `px-5`), adicionar um botão "Sair da conta" com estilo similar ao do AppSettings: ícone `LogOut` + texto muted, que chama `signOut()` e redireciona para `/`

Uma única alteração em um único arquivo.

