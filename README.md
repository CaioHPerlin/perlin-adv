# perlin-adv

Sistema web para monitoramento de publicações do Diário da Justiça Eletrônico Nacional (DJEN) e gestão de processos judiciais, voltado à advocacia de pequeno porte do município de Nova Andradina – MS.

---

## Como executar localmente

### Pré-requisitos

- Node.js em uma versão LTS compatível com o projeto;
- [pnpm](https://pnpm.io/);
- PostgreSQL em execução.

### 1. Instale as dependências

```bash
pnpm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Preencha ao menos estas variáveis:

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/perlin_adv?schema=public"
BETTER_AUTH_SECRET="gere-um-segredo-aleatorio-longo"
BETTER_AUTH_URL="http://localhost:8080"
PORT=8080
```

As configurações `SMTP_*` são opcionais em desenvolvimento; sem `SMTP_HOST`, os e-mails são registrados no console. A integração com o DJEN usa a URL pública por padrão. Quando necessário, `DJEN_API_URL` e `DJEN_API_KEY` também podem ser definidos no `.env`.

### 3. Crie o banco e aplique as migrações

Crie previamente no PostgreSQL o banco indicado em `DATABASE_URL` e execute:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

Para aplicar as migrações em produção, use:

```bash
pnpm prisma migrate deploy
```

### 4. Inicie a API

```bash
pnpm dev
```

A API estará disponível em `http://localhost:8080` (ou na porta configurada). Use os seguintes endereços para conferir a execução:

- Health check: `GET http://localhost:8080/`
- Documentação interativa: `http://localhost:8080/docs`
- Especificação OpenAPI: `http://localhost:8080/swagger.json`

As requisições de exemplo para o [Bruno](https://www.usebruno.com/) estão no diretório `bruno/`.

### Validação

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

O último comando formata os arquivos em `src/` e pode alterar o worktree.

---

## Requisitos Funcionais

| ID    | Descrição                                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF001 | O sistema deve permitir o registro de advogado mediante fornecimento de nome completo, e-mail, senha e número de inscrição na OAB.                                                                                                             |
| RF002 | O sistema deve autenticar o usuário, restringindo o acesso ao perfil vinculado ao número de OAB cadastrado.                                                                                                                                    |
| RF003 | O sistema deve permitir a redefinição de senha mediante verificação do e-mail cadastrado.                                                                                                                                                      |
| RF004 | O sistema deve realizar requisições à API do Diário de Justiça Eletrônico Nacional (DJEN/CNJ) para recuperar publicações vinculadas ao número de OAB do usuário, acionadas por agendamento diário (cron) e no momento do cadastro do advogado. |
| RF005 | O sistema deve exibir as publicações do usuário autenticado de forma paginada, ordenada por data, com acesso ao texto integral de cada publicação.                                                                                             |
| RF006 | O sistema deve permitir a marcação de publicações como **Lida** ou **Pendente**.                                                                                                                                                               |
| RF007 | O sistema deve permitir o cadastro, alteração, consulta e exclusão de processos judiciais, contendo número do processo, número da pasta, título, descrição, status e observação.                                                               |
| RF008 | O sistema deve identificar o número do processo no texto das publicações e vinculá-las automaticamente ao processo correspondente cadastrado.                                                                                                  |
| RF009 | O sistema deve permitir que o usuário vincule ou desvincule manualmente uma publicação a um processo cadastrado.                                                                                                                               |
| RF010 | O sistema deve exibir um painel inicial contendo o quantitativo de publicações não lidas e um feed das publicações mais recentes.                                                                                                              |
| RF011 | O sistema deve permitir a busca por termos dentro do conteúdo das publicações armazenadas.                                                                                                                                                     |
| RF012 | O sistema deve permitir que o usuário solicite a exclusão definitiva de seu perfil e de todos os dados associados.                                                                                                                             |
| RF013 | O sistema deve enviar notificação por e-mail ao usuário ao término de cada sincronização diária, informando o quantitativo de novas publicações identificadas.                                                                                 |

---

## Requisitos Não Funcionais

| ID     | Categoria          | Descrição                                                                                                                                                                             |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF001 | Segurança          | As senhas dos usuários devem ser armazenadas utilizando algoritmo de hash seguro (mínimo: bcrypt).                                                                                    |
| RNF002 | Segurança          | Todas as comunicações entre cliente e servidor devem ser realizadas sobre protocolo HTTPS.                                                                                            |
| RNF003 | Segurança          | O sistema deve autenticar o usuário por meio de sessão stateful armazenada em banco de dados, com token de sessão criptograficamente seguro e prazo de expiração definido.            |
| RNF004 | Conformidade       | O sistema deve observar os princípios da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018) no tratamento de dados pessoais de advogados e partes processuais.                |
| RNF005 | Disponibilidade    | O sistema deve garantir disponibilidade mínima de 95% no horário de coleta.                                                                                                           |
| RNF006 | Manutenibilidade   | O código-fonte deve seguir princípios de separação de responsabilidades, com camadas distintas para apresentação, regras de negócio e acesso a dados.                                 |
| RNF007 | Interoperabilidade | A integração com a API DJEN deve respeitar as restrições de _rate limiting_ impostas pelo CNJ, monitorando o cabeçalho HTTP `x-ratelimit-remaining` para evitar suspensão do serviço. |
| RNF008 | Interoperabilidade | O sistema deve tratar falhas de indisponibilidade da API DJEN com mecanismo de retry e registro de log do erro, sem interrupção do funcionamento da aplicação.                        |
| RNF009 | Usabilidade        | A interface deve ser responsiva, garantindo usabilidade em dispositivos móveis e desktops.                                                                                            |
| RNF010 | Portabilidade      | O sistema deve ser conteinerizável, permitindo implantação por meio de Docker ou Portainer.                                                                                           |

---

**Versão:** 1.1
**Autor:** Caio Hygino Perlin de Lima
