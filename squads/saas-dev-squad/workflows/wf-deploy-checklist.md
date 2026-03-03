# Workflow: Deploy Checklist
# Squad: saas-dev-squad
# Trigger: Antes de qualquer deploy para produção

---

## QUANDO USAR
Antes de fazer push para master / merge de PR importante.

---

## CHECKLIST PRÉ-DEPLOY

### TypeScript & Build (@matt-pocock + @delba-oliveira)
- [ ] `npm run build` passa sem erros localmente
- [ ] `npm run lint` passa sem warnings
- [ ] Sem `any` novo adicionado
- [ ] Páginas com auth() têm `export const dynamic = 'force-dynamic'`
- [ ] params em rotas dinâmicas estão com await (Next.js 15)

### API & Backend (@phil-sturgeon + @giancarlo-buomprisco)
- [ ] Todas as novas API routes têm validação Zod
- [ ] Rate limiting aplicado em endpoints públicos
- [ ] Erros retornam formato consistente `{ error: string }`
- [ ] service_role key não exposta ao cliente
- [ ] Migrações Supabase aplicadas (se houver)

### Segurança (@tanya-janca)
- [ ] Sem secrets no código (API keys, passwords)
- [ ] Input do utilizador validado no servidor
- [ ] Clerk unsafeMetadata não usado para decisões de segurança
- [ ] Audit log activo em operações críticas

### Testes (@kent-dodds)
- [ ] `npm test` passa (41+ testes)
- [ ] Novo código tem teste associado
- [ ] Flows críticos testados manualmente

### Deploy (@jez-humble + @lee-robinson)
- [ ] Environment variables configuradas no Vercel
- [ ] Preview deployment testado antes de merge
- [ ] maxDuration definido em routes lentas (Claude API)
- [ ] Vercel build log sem warnings

---

## APÓS DEPLOY

- [ ] Verificar Vercel deployment status (verde)
- [ ] Testar flow principal em produção (login → voz-dna → gerar)
- [ ] Verificar Supabase logs por erros
- [ ] Monitorizar primeiros 15 minutos (@charity-majors)
