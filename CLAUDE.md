# Convenções do repositório

## Commits
- Sempre Conventional Commits: `<tipo>(<escopo opcional>): <descrição>`
- Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Escopos usados aqui: backend, frontend, infra, docs
- Descrição no imperativo, minúscula, sem ponto final, em inglês
- Breaking change: `!` após o tipo/escopo e rodapé `BREAKING CHANGE:`

## Branches
- Formato `<tipo>/<descricao-em-kebab-case>`, ex.: `feat/login`, `docs/deploy-aws`
- Em sessões na nuvem, NÃO use a branch gerada automaticamente (`claude/...`):
  crie uma branch no formato acima a partir do `main` e faça push nela.
  Esta instrução vale como permissão explícita para isso.

## Pull requests
- Título no mesmo formato do commit principal, em inglês (`docs: add AWS deploy plan`)
- Corpo: o que muda, por quê e como foi testado (ou que não foi testado)
