# Sistema de Gerenciamento de Caixa, Estoque e Funcionários

## Atualização local - 23/11/2026

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
e os 8 testes de regressão em `tests/regressoes.test.mjs`. A dependência TypeScript
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
| Próxima etapa de produção | API, login com hash de senha e permissões por cargo | Seletor de operador é apenas demonstração, sem controle real de acesso |
| Operação completa | Editar/inativar cadastros e cancelar/estornar vendas e compras | UI atual permite cadastrar e operar os fluxos existentes |
| Operação completa | Gerenciar caixas físicos e imprimir comprovantes | Ainda não disponível na interface |
| Relatórios | Filtros de vendas/movimentos por data, relatórios e conferência por forma de pagamento | Busca implementada nesta etapa cobre apenas catálogo de produtos |
| Robustez de produção | Backup/importação, recuperação de dados inválidos e conflitos entre abas | Dados locais podem ser perdidos ao limpar o navegador ou restaurar a demo |
| Regras complementares | CPF/CNPJ únicos e validados, política para venda de produtos vencidos e arredondamentos financeiros | Alertas e validações atuais não substituem essas regras de produção |

Use apenas dados fictícios: senhas do protótipo permanecem em texto no armazenamento
local. O saldo esperado mantém a regra original (inicial + vendas de todas as formas),
sem representar exclusivamente o dinheiro físico da gaveta. Um estado local inválido
volta à demonstração; não há recuperação garantida dos dados antigos.

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
  - Abertura e fechamento de `SessaoCaixa` com alteração automática do status do `Caixa` (`LIVRE` / `OCUPADO`) e cálculo do saldo final esperado (`Valor_Inicial + Total de Vendas`).
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
- [ ] **Controle de Permissões por Cargo (RBAC):**
  - Restringir ações conforme o `Cargo`: por exemplo, apenas *Gerente* pode cadastrar funcionários/cargos, alterar preços ou fazer ajustes manuais de estoque; *Operador de Caixa* acessa apenas o PDV; *Estoquista* acessa Estoque e Compras.

### 3.3. Operações Complementares na Interface Gráfica (CRUD Completo e Relatórios)
- [ ] **Edição e Exclusão/Inativação de Registros:** Adicionar botões na interface para editar dados cadastrais (alterar preço de produto, atualizar cargo/salário de funcionário, editar cliente/fornecedor) e inativar registros sem quebrar o histórico de vendas.
- [ ] **Cancelamento / Estorno de Vendas e Compras:** Permitir cancelar uma venda ou compra registrada por engano, gerando automaticamente a movimentação inversa no estoque e estornando o valor da sessão de caixa.
- [ ] **Gestão Completa de Caixas Físicos na UI:** Permitir cadastrar novos terminais de `Caixa` e alternar manualmente o status para `MANUTENCAO` ou `LIVRE` diretamente pela interface gráfica.
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

# Executar a bateria de 22 testes automatizados de POO
npm test
```
