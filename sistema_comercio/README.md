# Sistema de Gerenciamento de Caixa, Estoque e Funcionários

## Atualização local - 25/11/2026

Esta etapa mantém os cinco módulos, o `index.html`, as classes TypeScript e o padrão
Observer originais. O objetivo é uma preview local de demonstração para pequenos e
médios comércios. O backlog das seções seguintes não constitui uma implementação
de produção pronta.

### Executar e testar

Pré-requisito: Node.js com npm (ambiente validado: Node.js 24.20.0).

```powershell
cd sistema_comercio
npm ci
npm test
npm run preview
```

`npm test` compila, atualiza `dist/app.bundle.js`, executa as 22 asserções originais
e 72 testes de regressão e regras de negócio em `tests/`. A dependência TypeScript
está declarada e fixada no `package-lock.json`.

Abra <http://127.0.0.1:4173>. O servidor atende somente na máquina local e libera
apenas HTML, CSS e bundle. Pare com `Ctrl+C` no terminal onde iniciou o servidor.
Se a porta estiver ocupada: `$env:PORT=4174; npm run preview`.
Para executar o bundle incluído sem instalar dependências: `node preview.mjs`.
Para recompilar após alterar `src/`: `npm run build`, depois recarregue a página.
O servidor não faz recarga automática.

### Compartilhar com o grupo

O ZIP de preview contém uma pasta `Trabalho-de-POO-Preview`. Extraia tudo e abra
o `index.html` dessa pasta para testar sem instalar dependências. Para testar a
partir do GitHub, use **Code > Download ZIP**, extraia e abra
`sistema_comercio/index.html`. Não abra os arquivos de dentro do visualizador do ZIP.

O [LEIA-ME.txt](LEIA-ME.txt) inclui um roteiro de vendas, compras, estoque e equipe.
O [Iniciar-Preview.cmd](Iniciar-Preview.cmd) inicia o servidor opcional no Windows
quando Node.js estiver instalado. Cada computador tem seus próprios dados de
demonstração; não há sincronização. O `localStorage` em `file://` pode variar entre
navegadores; use o servidor local para testar persistência de forma mais previsível.

### Correções de regras de negócio - versão local

- No cadastro de cargo, marque os módulos **Caixa, Estoque, Compras e/ou Equipe**.
  A seleção é explícita: um novo cargo chamado Operador de Caixa sem marcações não
  autoriza operações. Sem seleção, o colaborador acessa apenas Dashboard. Gerente
  (Gerente ou Gerente ...) possui acesso total aos quatro módulos, conforme o pedido
  atual, inclusive Caixa, sem precisar conceder uma autorização a si próprio.
- Em **Equipe > Autorizações por módulo**, selecione um gerente no topo, escolha
  o módulo, funcionário, ação e motivo (5 a 500 caracteres). Liberações individuais
  complementam o cargo; revogar uma delas não remove acesso herdado nem altera outros
  módulos. O quadro mostra a origem Gerente/Cargo/Individual/Sem acesso; o histórico inclui
  módulo, gestor, alvo, estados anterior/novo e horário, preservados ao recarregar.
- PDV: **Caixas da empresa > Cadastrar Caixa** cria número inteiro positivo e único.
  O formulário de abertura continua disponível mesmo com outra sessão aberta. Caixas
  ocupados ou em manutenção não podem ser reabertos; cada caixa tem uma sessão aberta.
- Em **Caixa desta venda / sessão aberta**, selecione o caixa antes de lançar itens.
  A escolha é salva por funcionário; recarregar não escolhe a primeira sessão global.
  Trocar o caixa ou funcionário limpa carrinho/pagamentos. Fechar atua somente na sessão
  escolhida e não encerra as demais. Sem seleção, o sistema pede que escolha um caixa.
- Colaborador autorizado opera apenas sessões próprias. O gerente pode operar e fechar
  qualquer sessão aberta: cada venda registra quem a realizou, separado de quem abriu
  o caixa. Movimentações e histórico identificam o operador real; vendas antigas sem esse
  campo seguem identificadas como histórico da sessão, sem atribuição nova inventada.
- Abas e painéis sem permissão ficam ocultos e não aceitam navegação; trocar de funcionário
  ou revogar acesso redireciona uma aba proibida ao Dashboard. Os serviços mantêm o bloqueio
  das operações. Dashboard permanece disponível; gerente visualiza todas as abas.
- Na migração, somente cargos antigos sem o campo de permissões usam o mapeamento:
  Operador de Caixa → Caixa; Gerente → Estoque/Compras/Equipe; Auxiliar de Estoque →
  Estoque/Compras. Outros nomes → nenhum. A liberação antiga de caixa vira autorização
  CAIXA, inclusive no histórico, sem fabricar eventos. Listas novas explicitamente vazias
  permanecem vazias para colaboradores, mesmo se o booleano legado era true; o gerente
  segue a nova regra de acesso total. Sessões/vendas são preservadas. Na ausência do mapa
  de seleção antigo, somente uma sessão própria inequívoca é adotada para seu responsável.
- A demo nova inicia com Operadora Demo (#2), responsável da sessão aberta, selecionada.
  Para gerenciar Estoque/Compras selecione Estoquista Demo (#3) ou Gerente Demo (#1); para cargos e
  funcionários selecione Gerente Demo. A autoridade para autorizar indivíduos continua sendo
  do cargo nominal Gerente ou Gerente ...; Equipe não dá essa autoridade a outro cargo.
  A troca livre de identidade continua nesta preview, sem autenticação real no servidor.
- Histórico de vendas mostra **número e ID do Caixa da sessão de cada venda**.
  Abertura, venda e fechamento também informam o número nas notificações. Isso independe
  do funcionário selecionado posteriormente e permanece após recarregar.
- Validade: nos alertas ou no catálogo, clique em **Corrigir data**. Confira a data
  na embalagem, informe a data correta e um motivo de 5 a 500 caracteres e salve.
  O histórico em Estoque registra produto, data anterior/nova, motivo, responsável
  selecionado no topo e data/hora. Persiste após recarregar, sem mudar quantidade,
  custo, preço ou vendas anteriores. Dados antigos sem esse histórico são aceitos.
- Produto realmente vencido: clique em **Dar baixa**, confira a quantidade e confirme
  em **Registrar Movimentação**. Isso registra SAIDA e preserva a data de validade.
  O indicador de vencidos conta somente produtos com saldo positivo; uma baixa total
  elimina esse alerta, mas o alerta de estoque mínimo pode continuar. Uma nova entrada
  não renova a data automaticamente. Data ainda vencida continua bloqueando a venda.
- Estoque zero exibe **---** na coluna Validade. A data original continua guardada:
  uma nova entrada a reapresenta e mantém o bloqueio se ainda estiver vencida.
- **Remover** produto/fornecedor retira o cadastro das novas operações e registra quem
  removeu e quando. O produto precisa ter estoque zero. Históricos e vínculos anteriores
  permanecem; itens removidos aparecem na lista de remoções, códigos/CNPJs ficam reservados.
  Carrinhos antigos com produto removido não finalizam; fornecedor removido não pode ser
  usado em novas compras ou vínculos. Não há exclusão física nem reativação nesta etapa.
- A correção trata erro cadastral; não prolonga a validade real. Há uma data por produto,
  sem controle de lotes. O operador identificado é o selecionado na demo, sem login real.
- `Venda` rejeita PIX/cartões acima do total e limita troco ao dinheiro recebido.
  Exemplo: venda de R$ 28,90 com PIX R$ 20 + espécie R$ 20 gera troco de R$ 11,10
  e entrada física líquida de R$ 8,90. Pagamento digital de R$ 30 é rejeitado.
- `SessaoCaixa` separa dinheiro físico, recebimentos digitais e saldo consolidado.
  Fechamento guarda o esperado, contagem opcional e diferença (sobra/falta).
  Sem contagem não se inventa conferência. Históricos antigos conservam o valor
  registrado, identificado como legado, sem reclassificação retroativa.
- Produtos vencidos são bloqueados ao adicionar e finalizar uma venda. Vendas
  históricas continuam carregando quando o produto venceu posteriormente.
- Novos CPFs e CNPJs numéricos são normalizados e validados pelos dígitos
  verificadores; duplicidade é bloqueada dentro de cada cadastro. Isso não verifica
  titularidade. Datas novas de admissão/validade precisam ser datas reais.
- Documentos legados são preservados na restauração, inclusive valores inválidos;
  o modo histórico é reservado à hidratação e não é exposto nos serviços de cadastro.
  Os documentos sintéticos da demo e a única fixture CNPJ da suíte original foram
  ajustados para dígitos válidos, sem enfraquecer as 22 asserções existentes.
- Falha de gravação produz aviso persistente e suprime notificação de sucesso.
  Alterações ficam em memória até uma gravação posterior bem-sucedida; recarregar
  antes disso perde essas alterações. O último JSON salvo permanece intacto.
- Dados inválidos são preservados na chave original. A demo roda em memória até
  recuperação ou restauração explicitamente confirmada. O reset salva uma cópia
  na chave `sistema_comercio_poo_v1_recuperacao_<data>` antes de substituir; se a
  cópia falha, a substituição é bloqueada. Não há tela de importação/restore.
- Um snapshot detecta alterações de outra aba antes de novas mutações e bloqueia
  a sobrescrita. Isso é proteção por comparação, não uma transação/lock entre abas:
  escritas rigorosamente simultâneas ainda exigem banco/API para garantia forte.

Essas regras permanecem no domínio/serviços, além da interface. O mínimo acadêmico
fornecido pelo professor pede comportamentos além de CRUD; SQL, API e login só
se tornam obrigatórios por outro requisito ou pelo objetivo de uso em produção.

### Matriz de operações e permissões da preview

| Módulo | Operações protegidas no serviço |
|---|---|
| Caixa | Cadastrar caixa/cliente, abrir/selecionar sessão e vender/fechar; colaborador usa a própria sessão, gerente qualquer sessão aberta |
| Estoque | Cadastrar categoria/produto, corrigir validade, registrar ajustes/entradas/saídas manuais e remover produto zerado |
| Compras | Cadastrar/remover fornecedor e registrar compra |
| Equipe | Cadastrar cargos e funcionários |

As abas dependem de acesso ao módulo; Dashboard é público na demo. Autorizações individuais exigem gerente ativo,
independentemente da permissão Equipe. Venda e compra movimentam estoque como parte
da ação principal, sem exigir uma segunda permissão Estoque. Verificações de conflito
e leitura antecedem as mutações. Inicialização interna da demo e construção de
cadastros-base numa instância sem funcionários são exceções de bootstrap; restaurar
a demo mantém o fluxo existente de confirmação e recuperação.

### Revisão complementar da retomada

- Cadastro de produto resolve e valida o funcionário responsável antes de inserir
  qualquer registro. Um responsável explícito inválido é rejeitado inclusive com
  estoque zero; estoque inicial positivo exige responsável para rastreabilidade.
- A comparação de snapshots também protege abas que estão em recuperação de JSON
  inválido. Uma aba antiga não pode substituir a recuperação já salva por outra.
- Se a leitura necessária para conferir o snapshot falhar, a operação é bloqueada
  antes de mutar ou gravar. O aviso permanece até uma leitura confiável permitir
  continuar ou detectar conflito. Isso é distinto da falha de gravação: quando a
  leitura funciona mas gravar falha, valem os avisos de mudanças apenas em memória.
- Quatro testes em `tests/retomada.test.mjs` reproduzem os problemas antes do patch
  e validam os bloqueios e a retomada segura depois. As 22 asserções originais e os
  24 testes anteriores foram preservados; naquela etapa eram 28 testes Node ao todo.
  Hoje são 72. Um cenário de persistência passou a preparar autorização e sessão própria,
  mantendo todas as suas asserções anteriores, conforme a nova regra solicitada.

### Continuidade implementada

- Busca de produtos por descrição, código e categoria, ignorando acentos; filtros
  de estoque baixo e vencimento; contador e mensagem sem resultados.
- Compra valida todos os itens antes de alterar estoque, custos e movimentos.
- Valores `NaN`, infinitos e negativos são rejeitados nas validações numéricas de
  domínio pertinentes; ajuste absoluto para zero registra zero, sem inventar uma unidade.
- Fechamento com valor inválido mantém a sessão aberta. Restauração reconcilia
  caixa ocupado e preserva o operador selecionado.
- Falha ao restaurar referências não mistura estado parcial com dados demo.
- Dados de cadastros interpolados nas tabelas e opções são escapados como texto.
- Restauração demo solicita confirmação; aviso de dados fictícios, foco visível,
  notificações acessíveis e ajustes de layout em telas pequenas.

### O que ainda falta

| Prioridade | Pendência | Consequência |
| --- | --- | --- |
| Próxima etapa de produção | SQL físico das 18 tabelas, Repository/DAO e transações | `localStorage` não é banco compartilhado nem garante ACID |
| Próxima etapa de produção | API, login com hash de senha e autorização no servidor | Módulos/cargos já controlam operações locais; seletor livre não comprova identidade real |
| Operação completa | Editar cadastros, reativar e cancelar/estornar operações | Remoção lógica de produtos/fornecedores já existe, preservando histórico |
| Operação completa | Manutenção de caixas e impressão de comprovantes | Cadastro, múltiplas sessões e seleção do caixa já estão na interface |
| Relatórios | Filtros de vendas/movimentos por data, relatórios e conferência por forma de pagamento | Busca implementada nesta etapa cobre apenas catálogo de produtos |
| Robustez de produção | Tela de backup/importação e controle transacional de concorrência | Recuperação protegida e detecção de conflito já existem; não substituem um banco compartilhado |
| Regras complementares | Evolução de formatos de documento, auditoria de alterações e regras adicionais acordadas | CPF/CNPJ numéricos, bloqueio de vencidos e pagamento/fechamento corrigidos nesta versão local |

Use apenas dados fictícios: senhas do protótipo permanecem em texto no armazenamento
local. O saldo esperado mostra dinheiro físico; o saldo consolidado soma o inicial
às vendas de todas as formas. Estados inválidos são preservados, com demo em memória
até ação explícita. Não há garantia de recuperação automática de qualquer dado inválido.

O diário técnico local distingue diagnóstico, execução, revisão independente e
limitações e é mantido separadamente da distribuição pública. A cópia de trabalho
teve origem em um export sem `.git`; atualizações remotas preservam o histórico do
repositório existente. Compartilhar o pacote não publica uma aplicação hospedada.

---

## 1. Sobre o Projeto e Alinhamento com as ODS

Pequenos e médios comércios varejistas (mercados, mercearias e lojas de bairro) frequentemente controlam vendas, estoque e equipe de forma manual ou em planilhas desconectadas, gerando erros no fechamento de caixa, ruptura ou excesso de estoque, perdas por vencimento e baixa rastreabilidade das operações.

Este sistema integra **Frente de Caixa (PDV)**, **Controle de Estoque e Compras** e **Gestão de Funcionários com Rastreabilidade**, alinhado aos Objetivos de Desenvolvimento Sustentável da ONU:
- **ODS 8 (Trabalho Decente e Crescimento Econômico):** Formalização de processos, organização de cargos, salários e responsabilidades da equipe.
- **ODS 9 (Indústria, Inovação e Infraestrutura):** Acesso a tecnologia de gestão integrada para pequenos comércios locais.
- **ODS 11 (Cidades e Comunidades Sustentáveis):** Fortalecimento do comércio de bairro e redução do desperdício de alimentos e produtos perecíveis por meio do controle de validade e estoque mínimo.

---

## 2. O Que Já Está Pronto Até Agora (Status Atual)

### 2.1. Modelagem Conceitual e Esquema Lógico do Banco de Dados
O modelo lógico documentado lista **18 entidades/tabelas e seus relacionamentos**; o esquema SQL físico permanece pendente:
1. `Categoria` (`ID_Categoria`, `Nome_Categoria`)
2. `Cargo` (`ID_Cargo`, `Nome_Cargo`, `Salario_Base`)
3. `Funcionario` (`ID_Funcionario`, `CPF_Funcionario`, `Nome_Funcionario`, `Senha`, `Data_Admissao`, `#ID_Cargo`)
4. `Telefone_Funcionario` (`#ID_Funcionario`, `Telefone_Funcionario`)
5. `Fornecedor` (`ID_Fornecedor`, `CNPJ`, `Razao_Social`, `Email`)
6. `Telefone_Fornecedor` (`#ID_Fornecedor`, `Telefone_Fornecedor`)
7. `Produto` (`Codigo_Barras`, `Descricao_Produto`, `Preco_Venda`, `Custo_Produto`, `Unidade_Medida`, `Qtd_Estoque`, `Estoque_Minimo`, `Data_Validade`, `#ID_Categoria`)
8. `Fornece` (`#ID_Fornecedor`, `#Codigo_Barras`)
9. `Compra` (`ID_Compra`, `Data_Compra`, `Valor_Total`, `#ID_Fornecedor`, `#ID_Funcionario`)
10. `Contem_Compra` (`#ID_Compra`, `#Codigo_Barras`, `Qtd_Compra`, `Custo_Unitario`)
11. `Movimentacao_Estoque` (`ID_Movimentacao`, `Data_Hora_Mov`, `Tipo`, `Qtd_Movimentacao`, `#Codigo_Barras`, `#ID_Funcionario`)
12. `Caixa` (`ID_Caixa`, `Numero_Caixa`, `Status_Caixa`)
13. `Sessao_Caixa` (`ID_Sessao`, `Data_Abertura`, `Data_Fechamento`, `Valor_Inicial`, `Valor_Final`, `#ID_Funcionario`, `#ID_Caixa`)
14. `Cliente` (`ID_Cliente`, `Nome_Cliente`, `Telefone_Cliente`, `CPF_Cliente`)
15. `Venda` (`ID_Venda`, `Data_Hora_Venda`, `Valor_Total`, `#ID_Sessao`, `#ID_Cliente`)
16. `Itens_Venda` (`#ID_Venda`, `#Codigo_Barras`, `Qtd_Venda`, `Preco_Unitario`)
17. `Forma_Pagamento` (`ID_Forma`, `Descricao`)
18. `Paga_Com` (`#ID_Venda`, `#ID_Forma`, `Valor_Pago`)

---

### 2.2. Arquitetura Orientada a Objetos em TypeScript (`src/`)
Toda a lógica do sistema foi implementada em **TypeScript (`strict: true`)**, aplicando os pilares de POO:
- **Encapsulamento e Validação de Domínio (`src/modelos/`):**
  - Atributos de domínio são `private`, acessados e modificados por métodos e *getters/setters* com validação de valores negativos, estoque insuficiente, sessão fechada e pagamento insuficiente. Isso não equivale a validação completa de produção.
  - Retorno de cópias defensivas em listas internas (`getItens()`, `getPagamentos()`, `getTelefones()`, `getFornecedores()`).
- **Composição vs. Associação:**
  - **Composição:** `Venda` compõe `ItemVenda` e `PagamentoVenda`; `Compra` compõe `ItemCompra`.
  - **Associação:** `Produto` associado a `Categoria` e `Fornecedor`; `SessaoCaixa` associada a `Caixa` e `Funcionario`.
- **Polimorfismo, Interfaces e Padrões de Projeto:**
  - Interface genérica `EntidadeIdentificavel<T>` implementada pelas entidades (`number` para IDs numéricos e `string` para `Codigo_Barras` de `Produto`).
  - Padrão **Observer** (`ObservadorSistema`) para atualizar a interface gráfica automaticamente a cada operação.
- **Regras de Negócio Implementadas (`src/servicos/GerenciadorSistema.ts`):**
  - Abertura e fechamento de `SessaoCaixa` com alteração automática do status do `Caixa` (`LIVRE` / `OCUPADO`) e cálculo do saldo final esperado (dinheiro físico inicial + recebimentos em espécie - trocos, com consolidado separado).
  - Registro de `Venda` com **múltiplas formas de pagamento** (`Paga_Com`), cálculo de troco, cliente opcional, baixa automática de estoque e geração de `MovimentacaoEstoque` (`SAIDA`) vinculada ao operador do caixa.
  - Registro de `Compra` junto a fornecedores com entrada automática no estoque, atualização do custo unitário do produto, vínculo automático `Fornece` e registro de `MovimentacaoEstoque` (`ENTRADA`).
  - Ajuste manual de estoque (`ENTRADA`, `SAIDA`, `AJUSTE`) e identificação automática de produtos **abaixo do estoque mínimo** e **vencidos**.
  - Consulta de **Rastreabilidade por Funcionário** (lista todas as sessões de caixa, compras e movimentações de estoque realizadas por cada colaborador).
  - Persistência local em JSON via `localStorage` com carga inicial de dados de demonstração.

---

### 2.3. Interface Gráfica Web (`index.html`, `estilos.css`, `src/ui/ControladorInterface.ts`)
Protótipo visual funcional dividido em 5 módulos:
1. **Visão Geral & Alertas (Dashboard):** KPIs financeiros e operacionais, tabela de alertas de estoque mínimo/validade e histórico recente de movimentações.
2. **Frente de Caixa (PDV):** Controle de abertura/fechamento de sessão, carrinho de itens, seleção/cadastro rápido de cliente e divisão do pagamento em múltiplas formas (`Dinheiro`, `PIX`, `Cartão de Débito`, `Cartão de Crédito`).
3. **Estoque & Produtos:** Cadastro de produtos e categorias, lançamento de movimentações/ajustes manuais e catálogo completo com indicadores visuais.
4. **Compras & Fornecedores:** Cadastro de fornecedores (com múltiplos telefones) e lançamento de notas de compra com entrada automática no estoque.
5. **Funcionários & Rastreabilidade:** Cadastro de funcionários e cargos, além do painel de auditoria de operações por colaborador.

---

### 2.4. Testes Automatizados (`src/teste_fluxo.ts`)
- Suíte com **22 asserções automatizadas** validando todo o fluxo de ponta a ponta (cadastros, compras, vendas com múltiplos pagamentos, bloqueios de erro, fechamento de caixa e rastreabilidade).

---

## 3. O Que Falta Para o Projeto Estar 100% Funcional (Próximos Passos)

Para evoluir do protótipo atual (que roda 100% no navegador com persistência em memória/`localStorage`) para um sistema de produção completo, faltam as seguintes etapas:

### 3.1. Banco de Dados Relacional em SQL (DDL, DML e Persistência Real)
Atualmente os dados são salvos em JSON no `localStorage`. Para o banco de dados estar 100% implementado, falta:
- [ ] **Script DDL (`schema.sql`):** Criar o script SQL físico (PostgreSQL, MySQL ou SQLite) com os comandos `CREATE TABLE` para as 18 tabelas listadas no esquema lógico, definindo:
  - Chaves primárias simples e compostas (`PRIMARY KEY`).
  - Chaves estrangeiras (`FOREIGN KEY`) com regras de integridade referencial (`ON DELETE RESTRICT` / `ON UPDATE CASCADE`).
  - Restrições de domínio (`CHECK (Preco_Venda >= 0)`, `CHECK (Qtd_Estoque >= 0)`, `UNIQUE (CPF_Funcionario)`, `UNIQUE (CNPJ)`).
- [ ] **Camada de Acesso a Dados (Repository / DAO com SQL):** Conectar as classes TypeScript ao banco SQL usando um driver/ORM (como `Prisma`, `TypeORM` ou `pg`/`sqlite3`), substituindo os arrays em memória de `GerenciadorSistema.ts` por consultas SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- [ ] **Transações ACID no Banco (`BEGIN / COMMIT / ROLLBACK`):** Garantir no banco de dados que uma `Venda` (inserção em `Venda`, `Itens_Venda`, `Paga_Com`, `Movimentacao_Estoque` e `UPDATE` de `Qtd_Estoque` em `Produto`) ocorra dentro de uma única transação atômica.
- [ ] **Consultas Analíticas e Views SQL:** Criar *Views* ou queries SQL com `JOIN`, `GROUP BY` e `SUM` para relatórios gerenciais (faturamento por período, produtos mais vendidos, divergência de fechamento de caixa e curva ABC de estoque).

### 3.2. Backend / API e Controle de Acesso (Autenticação e Permissões)
- [ ] **Servidor Backend em TypeScript (Node.js + Express/Fastify):** Separar a camada de regras de negócio e banco de dados em uma API RESTful para que múltiplos terminais de caixa possam acessar o mesmo banco simultaneamente.
- [ ] **Tela de Login Real e Criptografia de Senha:**
  - Implementar tela de login exigindo `CPF_Funcionario` e `Senha` antes de acessar o sistema (hoje a troca de operador é feita por um seletor rápido no topo para facilitar testes do protótipo).
  - Armazenar a senha do funcionário com hash seguro (`bcrypt`) em vez de texto puro.
- [ ] **Autorização de produção no servidor:**
  - A preview já protege operações por permissões explícitas do cargo e liberações individuais nos quatro módulos. Falta aplicar essas regras a identidades autenticadas no servidor, com credenciais protegidas e sem confiar no seletor/armazenamento local.

### 3.3. Operações Complementares na Interface Gráfica (CRUD Completo e Relatórios)
- [ ] **Edição e reativação de registros:** Remoção lógica de produtos/fornecedores já está disponível. Faltam editar cadastros e reativar registros conforme regras futuras, além de outros tipos de cadastro.
- [ ] **Cancelamento / Estorno de Vendas e Compras:** Permitir cancelar uma venda ou compra registrada por engano, gerando automaticamente a movimentação inversa no estoque e estornando o valor da sessão de caixa.
- [ ] **Manutenção de caixas na UI:** Cadastro de caixas e múltiplas sessões já estão disponíveis. Falta alternar manualmente manutenção/livre, respeitando sessões abertas.
- [ ] **Filtros de Busca e Impressão de Comprovantes:**
  - Barra de pesquisa e filtro por código de barras/nome/categoria/data nas tabelas de produtos, vendas e movimentações.
  - Geração de cupom de venda e relatório de conferência de fechamento de caixa (com cálculo de quebra/sobra entre o valor esperado e o valor físico contado no caixa).

---

## 4. Como Executar o Projeto Atual

### Abrir a Interface Gráfica
Basta abrir o arquivo [`index.html`](./index.html) em qualquer navegador web.

### Compilar o TypeScript e Executar os Testes Automatizados
No terminal, dentro da pasta `sistema_comercio`:
```powershell
# Compilar o TypeScript e atualizar o bundle do navegador
npm run build

# Executar as 22 asserções de POO e 72 testes de regressão/regras
npm test
```
