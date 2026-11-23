import { StatusCaixa, TipoMovimentacao } from "../modelos/Entidades.js";
export class ControladorInterface {
    escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[caractere]));
    }
    constructor(sistema) {
        this.carrinhoVenda = [];
        this.pagamentosVenda = [];
        this.itensNovaCompra = [];
        this.funcionarioRastreioId = 1;
        this.buscaProdutos = "";
        this.filtroProdutos = "todos";
        this.sistema = sistema;
        this.sistema.adicionarObservador(this);
    }
    inicializar() {
        if (typeof document === "undefined")
            return;
        this.configurarNavegacaoAbas();
        this.configurarEventosTopo();
        this.configurarEventosPDV();
        this.configurarEventosEstoque();
        this.configurarEventosCompras();
        this.configurarEventosEquipe();
        this.renderizarTudo();
    }
    atualizar(_evento, _dados) {
        if (typeof document === "undefined")
            return;
        this.renderizarTudo();
    }
    exibirNotificacao(mensagem, tipo = "sucesso") {
        const container = document.getElementById("toast-container");
        if (!container)
            return;
        const toast = document.createElement("div");
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensagem;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
    formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    // ==================== NAVEGAÇÃO E TOPO ====================
    configurarNavegacaoAbas() {
        const botoes = document.querySelectorAll(".nav-btn");
        botoes.forEach((btn) => {
            btn.addEventListener("click", () => {
                const alvo = btn.dataset.tab;
                if (!alvo)
                    return;
                botoes.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                botoes.forEach(b => b.setAttribute("aria-current", b === btn ? "page" : "false"));
                document.querySelectorAll(".tab-section").forEach((sec) => {
                    sec.classList.toggle("active", sec.id === `tab-${alvo}`);
                });
            });
        });
    }
    configurarEventosTopo() {
        const selectOperador = document.getElementById("select-operador-ativo");
        selectOperador?.addEventListener("change", () => {
            try {
                const id = Number(selectOperador.value);
                const func = this.sistema.definirFuncionarioAtivo(id);
                this.exibirNotificacao(`Operador ativo alterado para: ${func.getNomeFuncionario()}`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const btnReset = document.getElementById("btn-resetar-dados");
        btnReset?.addEventListener("click", () => {
            if (!window.confirm("Restaurar a demonstração? Cadastros, vendas e compras salvos neste navegador serão substituídos."))
                return;
            this.carrinhoVenda = [];
            this.pagamentosVenda = [];
            this.itensNovaCompra = [];
            this.sistema.resetarDadosParaPadrao();
            this.exibirNotificacao("Dados restaurados para o estado inicial de demonstração!");
        });
    }
    // ==================== EVENTOS DO PDV / CAIXA ====================
    configurarEventosPDV() {
        const formAbrirSessao = document.getElementById("form-abrir-sessao");
        formAbrirSessao?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const idCaixa = Number(document.getElementById("sessao-caixa-id").value);
                const valorInicial = Number(document.getElementById("sessao-valor-inicial").value);
                const operador = this.sistema.getFuncionarioLogado();
                if (!operador)
                    throw new Error("Selecione um funcionário operador no topo.");
                const sessao = this.sistema.abrirSessaoCaixa(idCaixa, operador.getIdFuncionario(), valorInicial);
                this.exibirNotificacao(`Sessão #${sessao.getIdSessao()} aberta no Caixa ${sessao.getCaixa().getNumeroCaixa()}!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const btnFecharSessao = document.getElementById("btn-fechar-sessao-atual");
        btnFecharSessao?.addEventListener("click", () => {
            try {
                const sessao = this.sistema.obterSessaoAbertaAtual();
                if (!sessao)
                    throw new Error("Não há sessão aberta no momento.");
                const inputConferido = document.getElementById("sessao-valor-conferido");
                const valorConferido = inputConferido && inputConferido.value.trim() !== ""
                    ? Number(inputConferido.value)
                    : undefined;
                this.sistema.fecharSessaoCaixa(sessao.getIdSessao(), valorConferido);
                if (inputConferido)
                    inputConferido.value = "";
                this.exibirNotificacao(`Sessão #${sessao.getIdSessao()} fechada com sucesso!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formAddItemVenda = document.getElementById("form-add-item-venda");
        formAddItemVenda?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const codigoBarras = document.getElementById("venda-produto-codigo").value;
                const qtd = Number(document.getElementById("venda-produto-qtd").value);
                if (!codigoBarras)
                    throw new Error("Selecione um produto.");
                if (qtd <= 0)
                    throw new Error("Informe uma quantidade válida.");
                const produto = this.sistema.buscarProdutoPorCodigo(codigoBarras);
                const existente = this.carrinhoVenda.find((i) => i.codigoBarras === codigoBarras);
                const qtdTotal = (existente ? existente.qtdVenda : 0) + qtd;
                if (qtdTotal > produto.getQtdEstoque()) {
                    throw new Error(`Estoque insuficiente para "${produto.getDescricaoProduto()}". Disponível: ${produto.getQtdEstoque()}.`);
                }
                if (existente) {
                    existente.qtdVenda = Number(qtdTotal.toFixed(3));
                }
                else {
                    this.carrinhoVenda.push({ codigoBarras, qtdVenda: qtd });
                }
                // Sugere automaticamente o valor restante no campo de pagamento
                this.atualizarSugestaoValorPagamento();
                this.renderizarPDV();
                this.exibirNotificacao(`"${produto.getDescricaoProduto()}" adicionado ao carrinho!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formAddPagVenda = document.getElementById("form-add-pagamento-venda");
        formAddPagVenda?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const idForma = Number(document.getElementById("venda-forma-pag").value);
                const valorPago = Number(document.getElementById("venda-valor-pag").value);
                if (valorPago <= 0)
                    throw new Error("Informe um valor de pagamento maior que zero.");
                this.pagamentosVenda.push({ idForma, valorPago: Number(valorPago.toFixed(2)) });
                this.atualizarSugestaoValorPagamento();
                this.renderizarPDV();
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const btnLimparCarrinho = document.getElementById("btn-limpar-venda");
        btnLimparCarrinho?.addEventListener("click", () => {
            this.carrinhoVenda = [];
            this.pagamentosVenda = [];
            this.renderizarPDV();
        });
        const btnFinalizarVenda = document.getElementById("btn-finalizar-venda");
        btnFinalizarVenda?.addEventListener("click", () => {
            try {
                const sessao = this.sistema.obterSessaoAbertaAtual();
                if (!sessao) {
                    throw new Error("Abra uma Sessão de Caixa antes de finalizar a venda.");
                }
                const selectCliente = document.getElementById("venda-cliente-id");
                const idCliente = selectCliente.value ? Number(selectCliente.value) : undefined;
                const venda = this.sistema.registrarVenda(sessao.getIdSessao(), this.carrinhoVenda, this.pagamentosVenda, idCliente);
                this.carrinhoVenda = [];
                this.pagamentosVenda = [];
                this.renderizarTudo();
                this.exibirNotificacao(`Venda #${venda.getIdVenda()} finalizada! Total: ${this.formatarMoeda(venda.getValorTotal())}`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formNovoCliente = document.getElementById("form-novo-cliente");
        formNovoCliente?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const nome = document.getElementById("cli-nome").value;
                const cpf = document.getElementById("cli-cpf").value;
                const tel = document.getElementById("cli-telefone").value;
                const novo = this.sistema.cadastrarCliente(nome, tel, cpf);
                formNovoCliente.reset();
                this.exibirNotificacao(`Cliente "${novo.getNomeCliente()}" cadastrado!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
    }
    calcularTotalCarrinho() {
        return this.carrinhoVenda.reduce((acc, item) => {
            const prod = this.sistema.buscarProdutoPorCodigo(item.codigoBarras);
            return Number((acc + prod.getPrecoVenda() * item.qtdVenda).toFixed(2));
        }, 0);
    }
    calcularTotalPagamentosCarrinho() {
        return this.pagamentosVenda.reduce((acc, p) => Number((acc + p.valorPago).toFixed(2)), 0);
    }
    atualizarSugestaoValorPagamento() {
        const inputValor = document.getElementById("venda-valor-pag");
        if (!inputValor)
            return;
        const restante = Math.max(0, this.calcularTotalCarrinho() - this.calcularTotalPagamentosCarrinho());
        inputValor.value = restante > 0 ? restante.toFixed(2) : "";
    }
    // ==================== EVENTOS DE ESTOQUE E PRODUTOS ====================
    configurarEventosEstoque() {
        document.getElementById("busca-produtos")?.addEventListener("input", evento => {
            this.buscaProdutos = evento.target.value;
            this.renderizarEstoque();
        });
        document.getElementById("filtro-produtos")?.addEventListener("change", evento => {
            this.filtroProdutos = evento.target.value;
            this.renderizarEstoque();
        });
        const formCategoria = document.getElementById("form-nova-categoria");
        formCategoria?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const nome = document.getElementById("cat-nome").value;
                const cat = this.sistema.cadastrarCategoria(nome);
                formCategoria.reset();
                this.exibirNotificacao(`Categoria "${cat.getNomeCategoria()}" cadastrada!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formProduto = document.getElementById("form-novo-produto");
        formProduto?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const codigo = document.getElementById("prod-codigo").value;
                const desc = document.getElementById("prod-descricao").value;
                const preco = Number(document.getElementById("prod-preco").value);
                const custo = Number(document.getElementById("prod-custo").value);
                const un = document.getElementById("prod-unidade").value;
                const qtd = Number(document.getElementById("prod-estoque").value);
                const min = Number(document.getElementById("prod-minimo").value);
                const validade = document.getElementById("prod-validade").value || undefined;
                const idCat = Number(document.getElementById("prod-categoria").value);
                const idFornVal = document.getElementById("prod-fornecedor").value;
                const idsForn = idFornVal ? [Number(idFornVal)] : [];
                const prod = this.sistema.cadastrarProduto(codigo, desc, preco, custo, un, qtd, min, idCat, validade, idsForn);
                formProduto.reset();
                this.exibirNotificacao(`Produto "${prod.getDescricaoProduto()}" cadastrado com sucesso!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formMov = document.getElementById("form-movimentacao-estoque");
        formMov?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const codigo = document.getElementById("mov-produto-codigo").value;
                const tipo = document.getElementById("mov-tipo").value;
                const qtd = Number(document.getElementById("mov-qtd").value);
                const operador = this.sistema.getFuncionarioLogado();
                if (!operador)
                    throw new Error("Selecione um funcionário operador no topo.");
                this.sistema.realizarAjusteEstoque(codigo, tipo, qtd, operador.getIdFuncionario());
                formMov.reset();
                this.exibirNotificacao(`Movimentação (${tipo}) registrada por ${operador.getNomeFuncionario()}!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
    }
    // ==================== EVENTOS DE COMPRAS E FORNECEDORES ====================
    configurarEventosCompras() {
        const formFornecedor = document.getElementById("form-novo-fornecedor");
        formFornecedor?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const cnpj = document.getElementById("forn-cnpj").value;
                const razao = document.getElementById("forn-razao").value;
                const email = document.getElementById("forn-email").value;
                const telsRaw = document.getElementById("forn-telefones").value;
                const telefones = telsRaw
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                const forn = this.sistema.cadastrarFornecedor(cnpj, razao, email, telefones);
                formFornecedor.reset();
                this.exibirNotificacao(`Fornecedor "${forn.getRazaoSocial()}" cadastrado!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formAddItemCompra = document.getElementById("form-add-item-compra");
        formAddItemCompra?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const codigoBarras = document.getElementById("compra-produto-codigo").value;
                const qtdCompra = Number(document.getElementById("compra-qtd").value);
                const custoUnitario = Number(document.getElementById("compra-custo").value);
                if (!codigoBarras)
                    throw new Error("Selecione um produto.");
                if (qtdCompra <= 0 || custoUnitario < 0) {
                    throw new Error("Quantidade e custo unitário devem ser válidos.");
                }
                this.itensNovaCompra.push({ codigoBarras, qtdCompra, custoUnitario });
                this.renderizarCompras();
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
        btnFinalizarCompra?.addEventListener("click", () => {
            try {
                const idFornecedor = Number(document.getElementById("compra-fornecedor-id").value);
                const operador = this.sistema.getFuncionarioLogado();
                if (!operador)
                    throw new Error("Selecione um funcionário responsável no topo.");
                const compra = this.sistema.registrarCompra(idFornecedor, operador.getIdFuncionario(), this.itensNovaCompra);
                this.itensNovaCompra = [];
                this.renderizarTudo();
                this.exibirNotificacao(`Compra #${compra.getIdCompra()} registrada! Estoque abastecido automaticamente.`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
    }
    // ==================== EVENTOS DE FUNCIONÁRIOS E CARGOS ====================
    configurarEventosEquipe() {
        const formCargo = document.getElementById("form-novo-cargo");
        formCargo?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const nome = document.getElementById("cargo-nome").value;
                const salario = Number(document.getElementById("cargo-salario").value);
                const cargo = this.sistema.cadastrarCargo(nome, salario);
                formCargo.reset();
                this.exibirNotificacao(`Cargo "${cargo.getNomeCargo()}" cadastrado!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formFuncionario = document.getElementById("form-novo-funcionario");
        formFuncionario?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const nome = document.getElementById("func-nome").value;
                const cpf = document.getElementById("func-cpf").value;
                const senha = document.getElementById("func-senha").value;
                const admissao = document.getElementById("func-admissao").value;
                const idCargo = Number(document.getElementById("func-cargo").value);
                const telsRaw = document.getElementById("func-telefones").value;
                const telefones = telsRaw
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                const func = this.sistema.cadastrarFuncionario(cpf, nome, senha, admissao, idCargo, telefones);
                formFuncionario.reset();
                this.exibirNotificacao(`Funcionário "${func.getNomeFuncionario()}" cadastrado!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const selectRastreio = document.getElementById("select-rastreio-funcionario");
        selectRastreio?.addEventListener("change", () => {
            this.funcionarioRastreioId = Number(selectRastreio.value);
            this.renderizarRastreabilidade();
        });
    }
    // ==================== RENDERIZAÇÃO COMPLETA ====================
    renderizarTudo() {
        this.renderizarTopo();
        this.renderizarDashboard();
        this.renderizarPDV();
        this.renderizarEstoque();
        this.renderizarCompras();
        this.renderizarEquipe();
    }
    renderizarTopo() {
        const selectOperador = document.getElementById("select-operador-ativo");
        const badgeCargo = document.getElementById("badge-cargo-operador");
        if (!selectOperador)
            return;
        const funcionarios = this.sistema.listarFuncionarios();
        const logado = this.sistema.getFuncionarioLogado();
        selectOperador.innerHTML = funcionarios
            .map((f) => `<option value="${f.getIdFuncionario()}" ${logado?.getIdFuncionario() === f.getIdFuncionario() ? "selected" : ""}>${this.escaparHTML(f.getNomeFuncionario())} (ID #${f.getIdFuncionario()})</option>`)
            .join("");
        if (badgeCargo && logado) {
            badgeCargo.textContent = logado.getCargo().getNomeCargo();
        }
    }
    renderizarDashboard() {
        const vendas = this.sistema.listarVendas();
        const totalVendasValor = vendas.reduce((acc, v) => acc + v.getValorTotal(), 0);
        const sessaoAberta = this.sistema.obterSessaoAbertaAtual();
        const abaixoMin = this.sistema.listarProdutosAbaixoDoMinimo();
        const vencidos = this.sistema.listarProdutosVencidos();
        this.definirTexto("kpi-total-vendas", this.formatarMoeda(totalVendasValor));
        this.definirTexto("kpi-qtd-vendas", `${vendas.length} venda(s) registrada(s)`);
        this.definirTexto("kpi-saldo-caixa", sessaoAberta ? this.formatarMoeda(sessaoAberta.calcularSaldoEsperado()) : "Caixa Fechado");
        this.definirTexto("kpi-status-sessao", sessaoAberta
            ? `Sessão #${sessaoAberta.getIdSessao()} (Caixa ${sessaoAberta.getCaixa().getNumeroCaixa()})`
            : "Nenhuma sessão ativa");
        this.definirTexto("kpi-estoque-critico", `${abaixoMin.length} item(ns)`);
        this.definirTexto("kpi-produtos-vencidos", `${vencidos.length} item(ns)`);
        const tbodyAlertas = document.getElementById("tbody-alertas-estoque");
        if (tbodyAlertas) {
            const listaAlertas = this.sistema
                .listarProdutos()
                .filter((p) => p.abaixoDoEstoqueMinimo() || p.estaVencido());
            tbodyAlertas.innerHTML =
                listaAlertas.length === 0
                    ? `<tr><td colspan="6" class="empty-msg">Nenhum alerta de estoque ou validade no momento.</td></tr>`
                    : listaAlertas
                        .map((p) => {
                        const tags = [];
                        if (p.abaixoDoEstoqueMinimo()) {
                            tags.push(`<span class="badge badge-warning">Abaixo do Mínimo</span>`);
                        }
                        if (p.estaVencido()) {
                            tags.push(`<span class="badge badge-danger">Vencido (${this.escaparHTML(p.getDataValidade())})</span>`);
                        }
                        return `<tr>
                                  <td><code>${this.escaparHTML(p.getCodigoBarras())}</code></td>
                                  <td><strong>${this.escaparHTML(p.getDescricaoProduto())}</strong></td>
                                  <td>${this.escaparHTML(p.getCategoria().getNomeCategoria())}</td>
                                  <td>${p.getQtdEstoque()} ${this.escaparHTML(p.getUnidadeMedida())}</td>
                                  <td>${p.getEstoqueMinimo()} ${this.escaparHTML(p.getUnidadeMedida())}</td>
                                  <td>${tags.join(" ")}</td>
                              </tr>`;
                    })
                        .join("");
        }
        const tbodyMov = document.getElementById("tbody-ultimas-movimentacoes");
        if (tbodyMov) {
            const movs = this.sistema.listarMovimentacoesEstoque().slice(0, 10);
            tbodyMov.innerHTML =
                movs.length === 0
                    ? `<tr><td colspan="6" class="empty-msg">Nenhuma movimentação registrada.</td></tr>`
                    : movs
                        .map((m) => {
                        const classeBadge = m.getTipo() === TipoMovimentacao.ENTRADA
                            ? "badge-success"
                            : m.getTipo() === TipoMovimentacao.SAIDA
                                ? "badge-danger"
                                : "badge-info";
                        return `<tr>
                                  <td>#${m.getIdMovimentacao()}</td>
                                  <td>${this.escaparHTML(m.getDataHoraMov())}</td>
                                  <td><span class="badge ${classeBadge}">${m.getTipo()}</span></td>
                                  <td>${this.escaparHTML(m.getProduto().getDescricaoProduto())}</td>
                                  <td>${m.getQtdMovimentacao()} ${this.escaparHTML(m.getProduto().getUnidadeMedida())}</td>
                                  <td>${this.escaparHTML(m.getFuncionarioResponsavel().getNomeFuncionario())}</td>
                              </tr>`;
                    })
                        .join("");
        }
    }
    renderizarPDV() {
        const sessaoAberta = this.sistema.obterSessaoAbertaAtual();
        const painelAbrir = document.getElementById("painel-abrir-sessao");
        const painelSessaoAtiva = document.getElementById("painel-sessao-ativa");
        if (painelAbrir && painelSessaoAtiva) {
            painelAbrir.style.display = sessaoAberta ? "none" : "block";
            painelSessaoAtiva.style.display = sessaoAberta ? "block" : "none";
        }
        const selectCaixa = document.getElementById("sessao-caixa-id");
        if (selectCaixa) {
            const caixasLivres = this.sistema
                .listarCaixas()
                .filter((c) => c.getStatusCaixa() === StatusCaixa.LIVRE);
            selectCaixa.innerHTML =
                caixasLivres.length === 0
                    ? `<option value="">Nenhum caixa livre</option>`
                    : caixasLivres
                        .map((c) => `<option value="${c.getIdCaixa()}">Caixa #0${c.getNumeroCaixa()} (${c.getStatusCaixa()})</option>`)
                        .join("");
        }
        if (sessaoAberta) {
            this.definirTexto("info-sessao-atual", `Sessão #${sessaoAberta.getIdSessao()} | Caixa #0${sessaoAberta.getCaixa().getNumeroCaixa()} | Operador: ${sessaoAberta.getFuncionario().getNomeFuncionario()}`);
            this.definirTexto("info-sessao-abertura", sessaoAberta.getDataAbertura());
            this.definirTexto("info-sessao-inicial", this.formatarMoeda(sessaoAberta.getValorInicial()));
            this.definirTexto("info-sessao-vendas", this.formatarMoeda(sessaoAberta.calcularTotalVendas()));
            this.definirTexto("info-sessao-esperado", this.formatarMoeda(sessaoAberta.calcularSaldoEsperado()));
        }
        // Selects do PDV
        const selectProdVenda = document.getElementById("venda-produto-codigo");
        if (selectProdVenda) {
            const valorAtual = selectProdVenda.value;
            selectProdVenda.innerHTML = this.sistema
                .listarProdutos()
                .map((p) => `<option value="${this.escaparHTML(p.getCodigoBarras())}">${this.escaparHTML(p.getDescricaoProduto())} — ${this.formatarMoeda(p.getPrecoVenda())} (Est: ${p.getQtdEstoque()} ${this.escaparHTML(p.getUnidadeMedida())})</option>`)
                .join("");
            if (valorAtual)
                selectProdVenda.value = valorAtual;
        }
        const selectCliente = document.getElementById("venda-cliente-id");
        if (selectCliente) {
            const valCli = selectCliente.value;
            selectCliente.innerHTML =
                `<option value="">Consumidor Não Identificado (Opcional)</option>` +
                    this.sistema
                        .listarClientes()
                        .map((c) => `<option value="${c.getIdCliente()}">${this.escaparHTML(c.getNomeCliente())} — CPF: ${this.escaparHTML(c.getCpfCliente())}</option>`)
                        .join("");
            if (valCli)
                selectCliente.value = valCli;
        }
        const selectFormaPag = document.getElementById("venda-forma-pag");
        if (selectFormaPag) {
            const valForma = selectFormaPag.value;
            selectFormaPag.innerHTML = this.sistema
                .listarFormasPagamento()
                .map((f) => `<option value="${f.getIdForma()}">${this.escaparHTML(f.getDescricao())}</option>`)
                .join("");
            if (valForma)
                selectFormaPag.value = valForma;
        }
        // Tabela de Itens no Carrinho
        const tbodyCarrinho = document.getElementById("tbody-carrinho-venda");
        if (tbodyCarrinho) {
            tbodyCarrinho.innerHTML =
                this.carrinhoVenda.length === 0
                    ? `<tr><td colspan="5" class="empty-msg">Nenhum produto no carrinho.</td></tr>`
                    : this.carrinhoVenda
                        .map((item, idx) => {
                        const prod = this.sistema.buscarProdutoPorCodigo(item.codigoBarras);
                        const sub = prod.getPrecoVenda() * item.qtdVenda;
                        return `<tr>
                                  <td>${this.escaparHTML(prod.getDescricaoProduto())}</td>
                                  <td>${item.qtdVenda} ${this.escaparHTML(prod.getUnidadeMedida())}</td>
                                  <td>${this.formatarMoeda(prod.getPrecoVenda())}</td>
                                  <td><strong>${this.formatarMoeda(sub)}</strong></td>
                                  <td><button type="button" class="btn-danger-sm btn-rem-item-venda" data-idx="${idx}">Remover</button></td>
                              </tr>`;
                    })
                        .join("");
            tbodyCarrinho.querySelectorAll(".btn-rem-item-venda").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const idx = Number(btn.dataset.idx);
                    this.carrinhoVenda.splice(idx, 1);
                    this.atualizarSugestaoValorPagamento();
                    this.renderizarPDV();
                });
            });
        }
        // Tabela de Pagamentos da Venda (Paga_Com)
        const tbodyPag = document.getElementById("tbody-pagamentos-venda");
        if (tbodyPag) {
            tbodyPag.innerHTML =
                this.pagamentosVenda.length === 0
                    ? `<tr><td colspan="3" class="empty-msg">Nenhuma forma de pagamento adicionada.</td></tr>`
                    : this.pagamentosVenda
                        .map((p, idx) => {
                        const forma = this.sistema.buscarFormaPagamentoPorId(p.idForma);
                        return `<tr>
                                  <td>${this.escaparHTML(forma.getDescricao())}</td>
                                  <td><strong>${this.formatarMoeda(p.valorPago)}</strong></td>
                                  <td><button type="button" class="btn-danger-sm btn-rem-pag-venda" data-idx="${idx}">Remover</button></td>
                              </tr>`;
                    })
                        .join("");
            tbodyPag.querySelectorAll(".btn-rem-pag-venda").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const idx = Number(btn.dataset.idx);
                    this.pagamentosVenda.splice(idx, 1);
                    this.atualizarSugestaoValorPagamento();
                    this.renderizarPDV();
                });
            });
        }
        const totalVenda = this.calcularTotalCarrinho();
        const totalPago = this.calcularTotalPagamentosCarrinho();
        const troco = Math.max(0, totalPago - totalVenda);
        this.definirTexto("resumo-venda-total", this.formatarMoeda(totalVenda));
        this.definirTexto("resumo-venda-pago", this.formatarMoeda(totalPago));
        this.definirTexto("resumo-venda-troco", this.formatarMoeda(troco));
        // Histórico de Vendas e Sessões
        const tbodyHistVendas = document.getElementById("tbody-historico-vendas");
        if (tbodyHistVendas) {
            const vendas = this.sistema.listarVendas();
            tbodyHistVendas.innerHTML =
                vendas.length === 0
                    ? `<tr><td colspan="7" class="empty-msg">Nenhuma venda realizada ainda.</td></tr>`
                    : vendas
                        .map((v) => {
                        const itensStr = v
                            .getItens()
                            .map((i) => `${i.getQtdVenda()}x ${this.escaparHTML(i.getProduto().getDescricaoProduto())}`)
                            .join(", ");
                        const pagsStr = v
                            .getPagamentos()
                            .map((p) => `${this.escaparHTML(p.getFormaPagamento().getDescricao())}: ${this.formatarMoeda(p.getValorPago())}`)
                            .join(" + ");
                        return `<tr>
                                  <td>#${v.getIdVenda()}</td>
                                  <td>${this.escaparHTML(v.getDataHoraVenda())}</td>
                                  <td>Sessão #${v.getSessaoCaixa().getIdSessao()} (${this.escaparHTML(v
                            .getSessaoCaixa()
                            .getFuncionario()
                            .getNomeFuncionario())})</td>
                                  <td>${v.getCliente() ? this.escaparHTML(v.getCliente().getNomeCliente()) : "Não identificado"}</td>
                                  <td>${itensStr}</td>
                                  <td>${pagsStr}</td>
                                  <td><strong>${this.formatarMoeda(v.getValorTotal())}</strong></td>
                              </tr>`;
                    })
                        .join("");
        }
    }
    renderizarEstoque() {
        const selectCat = document.getElementById("prod-categoria");
        if (selectCat) {
            selectCat.innerHTML = this.sistema
                .listarCategorias()
                .map((c) => `<option value="${c.getIdCategoria()}">${this.escaparHTML(c.getNomeCategoria())}</option>`)
                .join("");
        }
        const selectForn = document.getElementById("prod-fornecedor");
        if (selectForn) {
            selectForn.innerHTML =
                `<option value="">Sem fornecedor inicial</option>` +
                    this.sistema
                        .listarFornecedores()
                        .map((f) => `<option value="${f.getIdFornecedor()}">${this.escaparHTML(f.getRazaoSocial())}</option>`)
                        .join("");
        }
        const selectMovProd = document.getElementById("mov-produto-codigo");
        if (selectMovProd) {
            selectMovProd.innerHTML = this.sistema
                .listarProdutos()
                .map((p) => `<option value="${this.escaparHTML(p.getCodigoBarras())}">${this.escaparHTML(p.getDescricaoProduto())} (Atual: ${p.getQtdEstoque()} ${this.escaparHTML(p.getUnidadeMedida())})</option>`)
                .join("");
        }
        const tbodyProdutos = document.getElementById("tbody-lista-produtos");
        if (tbodyProdutos) {
            const normalizar = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const termo = normalizar(this.buscaProdutos.trim());
            const todos = this.sistema.listarProdutos();
            const filtrados = todos.filter(p => {
                const corresponde = normalizar(`${p.getCodigoBarras()} ${p.getDescricaoProduto()} ${p.getCategoria().getNomeCategoria()}`).includes(termo);
                return corresponde && (this.filtroProdutos === "todos" ||
                    (this.filtroProdutos === "baixo" && p.abaixoDoEstoqueMinimo()) ||
                    (this.filtroProdutos === "vencido" && p.estaVencido()));
            });
            this.definirTexto("contador-produtos", `${filtrados.length} de ${todos.length} produtos`);
            tbodyProdutos.innerHTML = filtrados
                .map((p) => {
                const statusEstoque = p.abaixoDoEstoqueMinimo()
                    ? `<span class="badge badge-warning">Baixo (${p.getQtdEstoque()}/${p.getEstoqueMinimo()})</span>`
                    : `<span class="badge badge-success">Normal (${p.getQtdEstoque()})</span>`;
                const validadeStr = p.getDataValidade()
                    ? p.estaVencido()
                        ? `<span class="badge badge-danger">Vencido: ${this.escaparHTML(p.getDataValidade())}</span>`
                        : this.escaparHTML(p.getDataValidade())
                    : "Não perecível";
                const forns = p
                    .getFornecedores()
                    .map((f) => f.getRazaoSocial())
                    .join(", ") || "—";
                return `<tr>
                        <td><code>${this.escaparHTML(p.getCodigoBarras())}</code></td>
                        <td><strong>${this.escaparHTML(p.getDescricaoProduto())}</strong></td>
                        <td>${this.escaparHTML(p.getCategoria().getNomeCategoria())}</td>
                        <td>${this.formatarMoeda(p.getCustoProduto())}</td>
                        <td><strong>${this.formatarMoeda(p.getPrecoVenda())}</strong></td>
                        <td>${statusEstoque} ${this.escaparHTML(p.getUnidadeMedida())}</td>
                        <td>${validadeStr}</td>
                        <td>${this.escaparHTML(forns)}</td>
                    </tr>`;
            })
                .join("") || '<tr><td colspan="8" class="empty-msg">Nenhum produto encontrado. Ajuste a busca ou o filtro.</td></tr>';
        }
    }
    renderizarCompras() {
        const selectFornCompra = document.getElementById("compra-fornecedor-id");
        if (selectFornCompra) {
            const val = selectFornCompra.value;
            selectFornCompra.innerHTML = this.sistema
                .listarFornecedores()
                .map((f) => `<option value="${f.getIdFornecedor()}">${this.escaparHTML(f.getRazaoSocial())} (${this.escaparHTML(f.getCnpj())})</option>`)
                .join("");
            if (val)
                selectFornCompra.value = val;
        }
        const selectProdCompra = document.getElementById("compra-produto-codigo");
        if (selectProdCompra) {
            const val = selectProdCompra.value;
            selectProdCompra.innerHTML = this.sistema
                .listarProdutos()
                .map((p) => `<option value="${this.escaparHTML(p.getCodigoBarras())}">${this.escaparHTML(p.getDescricaoProduto())} (Custo atual: ${this.formatarMoeda(p.getCustoProduto())})</option>`)
                .join("");
            if (val)
                selectProdCompra.value = val;
        }
        const tbodyItensCompra = document.getElementById("tbody-itens-nova-compra");
        if (tbodyItensCompra) {
            tbodyItensCompra.innerHTML =
                this.itensNovaCompra.length === 0
                    ? `<tr><td colspan="5" class="empty-msg">Adicione produtos à nota de compra.</td></tr>`
                    : this.itensNovaCompra
                        .map((item, idx) => {
                        const prod = this.sistema.buscarProdutoPorCodigo(item.codigoBarras);
                        const sub = item.qtdCompra * item.custoUnitario;
                        return `<tr>
                                  <td>${this.escaparHTML(prod.getDescricaoProduto())}</td>
                                  <td>${item.qtdCompra} ${this.escaparHTML(prod.getUnidadeMedida())}</td>
                                  <td>${this.formatarMoeda(item.custoUnitario)}</td>
                                  <td><strong>${this.formatarMoeda(sub)}</strong></td>
                                  <td><button type="button" class="btn-danger-sm btn-rem-item-compra" data-idx="${idx}">Remover</button></td>
                              </tr>`;
                    })
                        .join("");
            tbodyItensCompra.querySelectorAll(".btn-rem-item-compra").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const idx = Number(btn.dataset.idx);
                    this.itensNovaCompra.splice(idx, 1);
                    this.renderizarCompras();
                });
            });
        }
        const totalCompra = this.itensNovaCompra.reduce((acc, i) => acc + i.qtdCompra * i.custoUnitario, 0);
        this.definirTexto("resumo-compra-total", this.formatarMoeda(totalCompra));
        const tbodyFornecedores = document.getElementById("tbody-lista-fornecedores");
        if (tbodyFornecedores) {
            tbodyFornecedores.innerHTML = this.sistema
                .listarFornecedores()
                .map((f) => `<tr>
                        <td>#${f.getIdFornecedor()}</td>
                        <td><strong>${this.escaparHTML(f.getRazaoSocial())}</strong></td>
                        <td>${this.escaparHTML(f.getCnpj())}</td>
                        <td>${this.escaparHTML(f.getEmail())}</td>
                        <td>${this.escaparHTML(f.getTelefones().join(" / ")) || "—"}</td>
                    </tr>`)
                .join("");
        }
        const tbodyCompras = document.getElementById("tbody-historico-compras");
        if (tbodyCompras) {
            const compras = this.sistema.listarCompras();
            tbodyCompras.innerHTML =
                compras.length === 0
                    ? `<tr><td colspan="6" class="empty-msg">Nenhuma compra registrada.</td></tr>`
                    : compras
                        .map((c) => {
                        const resumoItens = c
                            .getItens()
                            .map((i) => `${i.getQtdCompra()}x ${this.escaparHTML(i.getProduto().getDescricaoProduto())} (${this.formatarMoeda(i.getCustoUnitario())})`)
                            .join(", ");
                        return `<tr>
                                  <td>#${c.getIdCompra()}</td>
                                  <td>${this.escaparHTML(c.getDataCompra())}</td>
                                  <td>${this.escaparHTML(c.getFornecedor().getRazaoSocial())}</td>
                                  <td>${this.escaparHTML(c.getFuncionarioResponsavel().getNomeFuncionario())}</td>
                                  <td>${resumoItens}</td>
                                  <td><strong>${this.formatarMoeda(c.getValorTotal())}</strong></td>
                              </tr>`;
                    })
                        .join("");
        }
    }
    renderizarEquipe() {
        const selectCargo = document.getElementById("func-cargo");
        if (selectCargo) {
            selectCargo.innerHTML = this.sistema
                .listarCargos()
                .map((c) => `<option value="${c.getIdCargo()}">${this.escaparHTML(c.getNomeCargo())} (${this.formatarMoeda(c.getSalarioBase())})</option>`)
                .join("");
        }
        const tbodyFuncionarios = document.getElementById("tbody-lista-funcionarios");
        if (tbodyFuncionarios) {
            tbodyFuncionarios.innerHTML = this.sistema
                .listarFuncionarios()
                .map((f) => `<tr>
                        <td>#${f.getIdFuncionario()}</td>
                        <td><strong>${this.escaparHTML(f.getNomeFuncionario())}</strong></td>
                        <td>${this.escaparHTML(f.getCpfFuncionario())}</td>
                        <td><span class="badge badge-info">${this.escaparHTML(f.getCargo().getNomeCargo())}</span></td>
                        <td>${this.formatarMoeda(f.getCargo().getSalarioBase())}</td>
                        <td>${this.escaparHTML(f.getDataAdmissao())}</td>
                        <td>${this.escaparHTML(f.getTelefones().join(" / ")) || "—"}</td>
                    </tr>`)
                .join("");
        }
        const selectRastreio = document.getElementById("select-rastreio-funcionario");
        if (selectRastreio) {
            selectRastreio.innerHTML = this.sistema
                .listarFuncionarios()
                .map((f) => `<option value="${f.getIdFuncionario()}" ${f.getIdFuncionario() === this.funcionarioRastreioId ? "selected" : ""}>${this.escaparHTML(f.getNomeFuncionario())} (${this.escaparHTML(f.getCargo().getNomeCargo())})</option>`)
                .join("");
        }
        this.renderizarRastreabilidade();
    }
    renderizarRastreabilidade() {
        const container = document.getElementById("painel-rastreabilidade-detalhes");
        if (!container)
            return;
        try {
            const dados = this.sistema.obterRastreabilidadeFuncionario(this.funcionarioRastreioId);
            container.innerHTML = `
                <div class="rastreio-grid">
                    <div class="rastreio-box">
                        <h4>Sessões de Caixa Operadas (${dados.sessoesCaixa.length})</h4>
                        <ul>
                            ${dados.sessoesCaixa.length === 0
                ? "<li>Nenhuma sessão operada.</li>"
                : dados.sessoesCaixa
                    .map((s) => `<li><strong>Sessão #${s.getIdSessao()}</strong> (Caixa 0${s
                    .getCaixa()
                    .getNumeroCaixa()}) — Abertura: ${this.escaparHTML(s.getDataAbertura())} | Inicial: ${this.formatarMoeda(s.getValorInicial())} | Status: ${s.estaAberta()
                    ? "Aberta"
                    : `Fechada (${this.formatarMoeda(s.getValorFinal() || 0)})`}</li>`)
                    .join("")}
                        </ul>
                    </div>
                    <div class="rastreio-box">
                        <h4>Compras Registradas (${dados.comprasRegistradas.length})</h4>
                        <ul>
                            ${dados.comprasRegistradas.length === 0
                ? "<li>Nenhuma compra registrada.</li>"
                : dados.comprasRegistradas
                    .map((c) => `<li><strong>Compra #${c.getIdCompra()}</strong> (${this.escaparHTML(c.getDataCompra())}) — ${this.escaparHTML(c
                    .getFornecedor()
                    .getRazaoSocial())} — Total: ${this.formatarMoeda(c.getValorTotal())}</li>`)
                    .join("")}
                        </ul>
                    </div>
                    <div class="rastreio-box">
                        <h4>Movimentações de Estoque (${dados.movimentacoesEstoque.length})</h4>
                        <ul>
                            ${dados.movimentacoesEstoque.length === 0
                ? "<li>Nenhuma movimentação realizada.</li>"
                : dados.movimentacoesEstoque
                    .slice(0, 8)
                    .map((m) => `<li><strong>[${m.getTipo()}]</strong> ${m.getQtdMovimentacao()}x ${this.escaparHTML(m
                    .getProduto()
                    .getDescricaoProduto())} (${this.escaparHTML(m.getDataHoraMov())})</li>`)
                    .join("")}
                        </ul>
                    </div>
                </div>
            `;
        }
        catch {
            container.innerHTML = `<p>Selecione um funcionário para visualizar a rastreabilidade.</p>`;
        }
    }
    definirTexto(idElemento, texto) {
        const el = document.getElementById(idElemento);
        if (el)
            el.textContent = texto;
    }
}
