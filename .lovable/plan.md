

# Fix: Texto invisível nos campos de cadastro

## Problema
Os `Input` e `select` no Register.tsx não têm a classe `text-foreground`, fazendo o texto digitado ficar escuro demais no tema dark. O Login.tsx funciona porque seus inputs incluem `text-foreground` explicitamente.

## Solução
Adicionar `text-foreground` a todos os campos de input, select e textarea no Register.tsx — mesma abordagem usada no Login.tsx.

### Campos afetados (7 no total):
1. **Step 1**: Email input (linha 137), Password input (linha 142), Matrícula input (linha 150)
2. **Step 2**: Nome input (linha 160), Data nascimento input (linha 164)
3. **Step 3**: Curso select (linha 173) e Período select (linha 180) — já têm `text-foreground`, OK
4. **Step 5**: Bio textarea (linha 241) — já tem `text-foreground`, OK
5. **Step 6**: Instagram input (linha 279)

### Mudança concreta
Adicionar `text-foreground` à className de cada `Input` nos steps 1, 2 e 6. Exemplo:
- De: `className="h-12 rounded-xl bg-muted/50 border-border/50"`
- Para: `className="h-12 rounded-xl bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary"`

Isso alinha o estilo com o Login.tsx que usa `text-foreground placeholder:text-muted-foreground focus:border-primary` em todos os campos.

