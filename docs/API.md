# OPB Crew — Documentação das APIs

Todas as rotas requerem autenticação Clerk, excepto `/api/waitlist`.

---

## POST /api/generate

Gera conteúdo com Claude na voz do utilizador.

**Auth:** Clerk (obrigatório)

**Body:**
```json
{
  "platform": "instagram | linkedin | twitter | email",
  "topic": "string (3-500 chars)",
  "vozDNA": { ... } // opcional — DNA de Voz do utilizador
}
```

**Response 200:**
```json
{
  "content": "string",
  "platform": "instagram",
  "topic": "string",
  "tokens": 1234
}
```

**Erros:** 400 (input inválido), 401 (não autenticado), 500 (erro Claude API)

---

## GET /api/content

Devolve histórico de conteúdo gerado (últimos 20).

**Auth:** Clerk (obrigatório)

**Response 200:**
```json
{
  "content": [
    {
      "id": "uuid",
      "platform": "instagram",
      "topic": "string",
      "content": "string",
      "created_at": "2026-02-28T..."
    }
  ]
}
```

---

## DELETE /api/content?id={uuid}

Apaga um item do histórico. Só apaga itens do próprio utilizador.

**Auth:** Clerk (obrigatório)

**Query params:** `id` (UUID obrigatório)

**Response 200:**
```json
{ "success": true }
```

**Erros:** 400 (id inválido ou em falta), 401, 500

---

## POST /api/voz-dna

Guarda o Voz & DNA do utilizador no Clerk (unsafeMetadata).

**Auth:** Clerk (obrigatório)

**Body:**
```json
{
  "vozDNA": {
    "arquetipo": "string",
    "tomEmTresPalavras": ["string"],
    "vocabularioActivo": ["string"],
    "vocabularioProibido": ["string"],
    "frasesAssinatura": ["string"],
    "regrasEstilo": ["string"]
  }
}
```

**Response 200:**
```json
{ "success": true }
```

---

## POST /api/manifesto

Gera os 10 blocos do Manifesto do Solopreneur com Claude.

**Auth:** Clerk (obrigatório)

**Body:**
```json
{
  "answers": {
    "especialidade": "string",
    "personalidade": "string",
    "irritacoes": "string",
    "publicoAlvo": "string",
    "transformacao": "string",
    "resultados": "string",
    "crencas": "string",
    "proposito": "string",
    "visao": "string"
  }
}
```

---

## POST /api/viral-research

Pesquisa conteúdo viral sobre um tema usando Tavily.

**Auth:** Clerk (obrigatório)

**Body:**
```json
{ "topic": "string" }
```

---

## GET /api/admin/users

Lista todos os utilizadores. Só acessível a super admins.

**Auth:** Clerk + isAdmin() (obrigatório)

**Response 200:**
```json
{
  "users": [
    {
      "user_id": "user_xxx",
      "email": "email@exemplo.com",
      "name": "Nome",
      "genius_complete": true,
      "manifesto_complete": true,
      "voz_dna_complete": false,
      "created_at": "2026-02-28T..."
    }
  ]
}
```

**Erros:** 403 (não é admin), 500

---

## POST /api/waitlist

Adiciona email à lista de espera. Rota pública.

**Auth:** Nenhuma

**Body:**
```json
{
  "email": "email@exemplo.com",
  "name": "Nome (opcional)"
}
```

**Response 200:**
```json
{ "success": true }
```
