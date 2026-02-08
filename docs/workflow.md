# FarolRural V3 — Git Workflow

## Branches

| Branch | Propósito | Regra |
|--------|-----------|-------|
| `main` | Produção / MVP congelado | Somente hotfix. Nunca commit direto. |
| `mvp-reset` | Branch de desenvolvimento ativa | Evolução do MVP, novas features. |

## Fluxo de trabalho

```
mvp-reset (develop)  →  feature branches (opcional)  →  merge para mvp-reset
                                                        ↓
                                              Quando estável: merge --no-ff para main + tag
```

## Convenções de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` — nova funcionalidade
- `fix(scope):` — correção de bug
- `chore(scope):` — manutenção, refactoring
- `docs(scope):` — documentação
- `style(scope):` — formatação (sem mudança de lógica)

## Tags de release

Formato: `vX.Y.Z-suffix`

| Tag | Descrição |
|-----|-----------|
| `v0.1.0-mvp` | MVP baseline — search, cards, cotações, weather, feedback |

## Hotfix na main

```bash
git checkout main
git checkout -b hotfix/descricao
# ... fix ...
git commit -m "fix(scope): descricao"
git checkout main
git merge --no-ff hotfix/descricao
git tag vX.Y.Z-hotfix
git checkout mvp-reset
git merge main  # trazer o fix para develop
```
