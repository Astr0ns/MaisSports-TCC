## 🛠️ Correções e Debugging

Durante o desenvolvimento do projeto, o sistema passou por uma sessão intensa de debugging e modernização, migrando de MySQL para PostgreSQL (Supabase) e corrigindo diversos bugs herdados dessa transição. Abaixo está o resumo das principais correções aplicadas.

### 🗄️ Banco de Dados

- 🔌 **Configuração do Supabase**: resolvido erro de conexão (`ENETUNREACH`, `tenant/user not found`) configurando corretamente a *connection string* do pooler do Supabase no `.env`.
- 🐛 **Coluna `sobrenome` como `NULL`**: corrigido destructuring e query `INSERT` que não incluíam o campo `sobrenome` no cadastro de usuário.
- 🔗 **Colunas de Foreign Key desatualizadas**: corrigidos nomes de colunas que mudaram durante a migração para PostgreSQL (`fk_id_espaco_local` → `fk_id_espaco`, `id_espaco_local` → `id`, `id_reserva` → `id`), presentes em múltiplas queries de `reservaController.js`.
- 📊 **Erros de `GROUP BY`**: corrigidas queries SQL que agrupavam por colunas ausentes do `SELECT`, causando erro `column must appear in the GROUP BY clause`.

### 🎨 Front-end / Interface

- 🌗 **Flash of Unstyled Content no Dark Mode**: modo escuro passou a ser aplicado via `<script>` inline no início do `<body>`, eliminando o "flash" de tela clara ao trocar de página.
- 🖌️ **Conflito de estilos inline com Dark Mode**: substituição de `element.style.propriedade` por toggle de classes CSS, permitindo que o dark mode funcione sem sobrescrever estilos definidos via JavaScript.
- 🚩 **Flash messages aparecendo indevidamente**: corrigida verificação de arrays vazios (`error_msg`/`success_msg`) do `connect-flash`, que antes eram sempre "truthy" mesmo vazios.
- 📉 **Bug crítico de `class="price"` duplicada**: a função `saberPreco()` usava um seletor genérico (`.price`) que colidia com outras seções da página (edição de preço do produto, card de prévia), estourando o array de preços e quebrando a atribuição do valor do plano selecionado. Corrigido escopando o seletor para `.plan .price`.
- 📄 **Página 404 ausente**: criada view `404.ejs` para rotas inexistentes.

### 💳 Integração com Mercado Pago

- 🧪 **Redirecionamento incorreto em ambiente de testes**: substituído `response.init_point` (produção) por `response.sandbox_init_point` quando credenciais de teste (`TEST-...`) são utilizadas, eliminando o erro *"Uma das partes é de teste"*.
- 🔑 **Chave de idempotência fixa**: removida `idempotencyKey` estática (`'abc'`) compartilhada entre todas as requisições, que causava rejeição de pagamentos por conflito de identificação de transações.
- 🧾 **Campo `auto_return` inválido**: corrigido uso indevido de uma variável de rota (`all`, importada de `productRouter.js`) no lugar da string esperada pela API (`'all'`).

### 🔐 Boas práticas

- 🔒 Substituição de `accessToken` fixo no código por variável de ambiente (`process.env.MP_ACCESS_TOKEN`).
- 📝 Recomendação de reset de credenciais expostas acidentalmente durante o desenvolvimento.

---

> 💡 Este changelog documenta o processo de debugging e modernização do projeto **MaisSports-TCC**, servindo como registro técnico das decisões tomadas durante a migração de stack e correção de bugs legados.