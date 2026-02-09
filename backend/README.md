# FarolV3 Backend

Backend core desacoplado para migração futura de lógica do n8n.

## Estrutura

```
/backend
├── src/
│   ├── contracts/     # Schemas de request/response
│   ├── services/      # Interfaces de serviços
│   ├── utils/         # Normalizers e helpers
│   └── tests/         # Testes unitários
└── README.md
```

## Filosofia

- **Contrato primeiro**: cada serviço tem interface tipada
- **Pseudo-implementação**: lógica mapeada do n8n
- **Migração gradual**: n8n → backend sem reescrever

## Rodar localmente

```bash
cd backend
npm install
npm test
```

## Status

| Componente | Status |
|------------|--------|
| contracts/ | ✅ Criado |
| services/  | ✅ Interfaces |
| utils/     | ✅ Normalizers |
| tests/     | ⏸️ Pendente |
