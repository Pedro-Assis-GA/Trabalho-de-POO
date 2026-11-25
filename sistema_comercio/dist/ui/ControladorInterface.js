import { ModuloSistema, StatusCaixa, TipoMovimentacao } from "../modelos/Entidades.js";
export class ControladorInterface {
    escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[caractere]));
    }
    constructor(sistema) {
        this.nomesModulos = { CAIXA: "Caixa", ESTOQUE: "Estoque", COMPRAS: "Compras", EQUIPE: "Equipe" };
        this.carrinhoVenda = [];
        this.pagamentosVenda = [];
        this.itensNovaCompra = [];
        this.funcionarioRastreioId = 1;
        this.buscaProdutos = "";
        this.filtroProdutos = "todos";
        this.abaAtual = "dashboard";
        this.contextoCarrinho = null;
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
        const aviso = this.sistema.getAvisoPersistencia();
        if (tipo === "sucesso" && aviso) {
            mensagem = "Atenção: os dados desta aba não estão salvos. " + aviso;
            tipo = "erro";
        }
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
                if (!this.podeAcessarAba(alvo)) {
                    this.exibirNotificacao("Você não tem autorização para acessar esta aba.", "erro");
                    return;
                }
                this.abaAtual = alvo;
                this.renderizarNavegacao();
            });
        });
    }
    podeAcessarAba(aba) {
        if (aba === "dashboard")
            return true;
        const modulos = { pdv: ModuloSistema.CAIXA, estoque: ModuloSistema.ESTOQUE, compras: ModuloSistema.COMPRAS, equipe: ModuloSistema.EQUIPE };
        return !!modulos[aba] && !!this.sistema.getFuncionarioLogado()?.temAcessoModulo(modulos[aba]);
    }
    renderizarNavegacao() {
        if (!this.podeAcessarAba(this.abaAtual))
            this.abaAtual = "dashboard";
        document.querySelectorAll(".nav-btn").forEach(btn => {
            const aba = btn.dataset.tab || "";
            btn.hidden = !this.podeAcessarAba(aba);
            btn.disabled = btn.hidden;
            btn.classList.toggle("active", aba === this.abaAtual);
            btn.setAttribute("aria-current", aba === this.abaAtual ? "page" : "false");
        });
        document.querySelectorAll(".tab-section").forEach(sec => {
            const aba = sec.id.replace("tab-", "");
            sec.hidden = !this.podeAcessarAba(aba);
            sec.classList.toggle("active", !sec.hidden && aba === this.abaAtual);
        });
    }
    configurarEventosTopo() {
        const selectOperador = document.getElementById("select-operador-ativo");
        selectOperador?.addEventListener("change", () => {
            try {
                const id = Number(selectOperador.value);
                const anterior = this.sistema.getFuncionarioLogado()?.getIdFuncionario();
                const func = this.sistema.definirFuncionarioAtivo(id);
                if (anterior !== id) {
                    this.carrinhoVenda = [];
                    this.pagamentosVenda = [];
                    this.renderizarPDV();
                }
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
            const anteriores = [this.carrinhoVenda, this.pagamentosVenda, this.itensNovaCompra];
            this.carrinhoVenda = [];
            this.pagamentosVenda = [];
            this.itensNovaCompra = [];
            try {
                this.sistema.resetarDadosParaPadrao();
                this.exibirNotificacao("Dados restaurados para o estado inicial de demonstração!");
            }
            catch (e) {
                [this.carrinhoVenda, this.pagamentosVenda, this.itensNovaCompra] = anteriores;
                this.renderizarTudo();
                this.exibirNotificacao(e.message, "erro");
            }
        });
    }
    // ==================== EVENTOS DO PDV / CAIXA ====================
    configurarEventosPDV() {
        document.getElementById("form-novo-caixa")?.addEventListener("submit", evento => {
            evento.preventDefault();
            try {
                const numero = document.getElementById("novo-caixa-numero");
                const caixa = this.sistema.cadastrarCaixa(Number(numero.value));
                numero.value = "";
                this.exibirNotificacao(`Caixa #${caixa.getNumeroCaixa()} cadastrado e disponível para abertura.`);
            }
            catch (erro) {
                this.exibirNotificacao(erro.message, "erro");
            }
        });
        document.getElementById("pdv-sessao-id")?.addEventListener("change", () => {
            const anteriores = [this.carrinhoVenda, this.pagamentosVenda];
            this.carrinhoVenda = [];
            this.pagamentosVenda = [];
            try {
                this.sistema.selecionarSessaoCaixa(Number(document.getElementById("pdv-sessao-id").value));
                this.exibirNotificacao("Caixa da venda selecionado. Itens e pagamentos foram limpos para evitar lançamento em outro caixa.");
            }
            catch (erro) {
                [this.carrinhoVenda, this.pagamentosVenda] = anteriores;
                this.exibirNotificacao(erro.message, "erro");
                this.renderizarPDV();
            }
        });
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
                this.exibirNotificacao(`Sessão #${sessao.getIdSessao()} aberta no Caixa #${sessao.getCaixa().getNumeroCaixa()}!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const btnFecharSessao = document.getElementById("btn-fechar-sessao-atual");
        btnFecharSessao?.addEventListener("click", () => {
            try {
                const sessao = this.sistema.obterSessaoSelecionada();
                if (!sessao)
                    throw new Error("Não há sessão aberta no momento.");
                const inputConferido = document.getElementById("sessao-valor-conferido");
                const valorConferido = inputConferido && inputConferido.value.trim() !== ""
                    ? Number(inputConferido.value)
                    : undefined;
                this.sistema.fecharSessaoCaixa(sessao.getIdSessao(), valorConferido);
                if (inputConferido)
                    inputConferido.value = "";
                this.exibirNotificacao(`Sessão #${sessao.getIdSessao()} do Caixa #${sessao.getCaixa().getNumeroCaixa()} fechada com sucesso!`);
            }
            catch (e) {
                this.exibirNotificacao(e.message, "erro");
            }
        });
        const formAddItemVenda = document.getElementById("form-add-item-venda");
        formAddItemVenda?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const sessao = this.sistema.obterSessaoSelecionada();
                if (!sessao)
                    throw new Error("Abra uma sessão antes de adicionar itens.");
                this.sistema.verificarAcessoCaixa(sessao.getIdSessao());
                const codigoBarras = document.getElementById("venda-produto-codigo").value;
                const qtd = Number(document.getElementById("venda-produto-qtd").value);
                if (!codigoBarras)
                    throw new Error("Selecione um produto.");
                if (qtd <= 0)
                    throw new Error("Informe uma quantidade válida.");
                const produto = this.sistema.buscarProdutoPorCodigo(codigoBarras);
                if (produto.estaVencido())
                    throw new Error("Produto vencido. Não pode ser adicionado à venda.");
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
                const sessao = this.sistema.obterSessaoSelecionada();
                if (!sessao)
                    throw new Error("Abra uma sessão antes de informar pagamentos.");
                this.sistema.verificarAcessoCaixa(sessao.getIdSessao());
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
                const sessao = this.sistema.obterSessaoSelecionada();
                if (!sessao) {
                    throw new Error("Abra uma Sessão de Caixa antes de finalizar a venda.");
                }
                const selectCliente = document.getElementById("venda-cliente-id");
                const idCliente = selectCliente.value ? Number(selectCliente.value) : undefined;
                const venda = this.sistema.registrarVenda(sessao.getIdSessao(), this.carrinhoVenda, this.pagamentosVenda, idCliente);
                this.carrinhoVenda = [];
                this.pagamentosVenda = [];
                this.renderizarTudo();
                this.exibirNotificacao(`Venda #${venda.getIdVenda()} finalizada no Caixa #${venda.getSessaoCaixa().getCaixa().getNumeroCaixa()} (Sessão #${venda.getSessaoCaixa().getIdSessao()})! Total: ${this.formatarMoeda(venda.getValorTotal())}`);
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
        for (const id of ["tbody-alertas-estoque", "tbody-lista-produtos"]) {
            document.getElementById(id)?.addEventListener("click", evento => {
                const remover = evento.target.closest("button[data-remover-produto]");
                if (remover?.dataset.removerProduto) {
                    try {
                        this.sistema.verificarAcessoModulo(ModuloSistema.ESTOQUE);
                        if (!window.confirm("Remover este produto do catálogo? O estoque deve estar zerado; o histórico será preservado."))
                            return;
                        this.sistema.removerProduto(remover.dataset.removerProduto);
                        this.exibirNotificacao("Produto removido do catálogo. Histórico preservado.");
                    }
                    catch (erro) {
                        this.exibirNotificacao(erro.message, "erro");
                    }
                    return;
                }
                const botao = evento.target.closest("button[data-validade-acao]");
                if (!botao)
                    return;
                this.prepararAcaoValidade(botao.dataset.codigo, botao.dataset.validadeAcao);
            });
        }
        document.getElementById("correcao-validade-produto")?.addEventListener("change", () => {
            this.atualizarValidadeAtual();
            document.getElementById("correcao-validade-nova").value = "";
            document.getElementById("correcao-validade-motivo").value = "";
        });
        document.getElementById("form-corrigir-validade")?.addEventListener("submit", evento => {
            evento.preventDefault();
            try {
                const operador = this.sistema.getFuncionarioLogado();
                if (!operador)
                    throw new Error("Selecione um funcionário operador no topo.");
                const codigo = document.getElementById("correcao-validade-produto").value;
                const data = document.getElementById("correcao-validade-nova");
                const motivo = document.getElementById("correcao-validade-motivo");
                this.sistema.corrigirValidadeProduto(codigo, data.value, motivo.value, operador.getIdFuncionario());
                data.value = "";
                motivo.value = "";
                this.exibirNotificacao("Correção de validade registrada com responsável e motivo.");
            }
            catch (erro) {
                this.exibirNotificacao(erro.message, "erro");
            }
        });
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
    botoesValidade(produto) {
        const codigo = this.escaparHTML(produto.getCodigoBarras());
        return `<button type="button" class="btn btn-secondary" data-validade-acao="corrigir" data-codigo="${codigo}">Corrigir data</button>` +
            (produto.estaVencido() && produto.getQtdEstoque() > 0 ? ` <button type="button" class="btn btn-danger" data-validade-acao="baixa" data-codigo="${codigo}">Dar baixa</button>` : "");
    }
    atualizarValidadeAtual() {
        const select = document.getElementById("correcao-validade-produto");
        if (!select?.value) {
            this.definirTexto("correcao-validade-atual", "Selecione um produto.");
            return;
        }
        const produto = this.sistema.buscarProdutoPorCodigo(select.value);
        this.definirTexto("correcao-validade-atual", `Validade atual: ${produto.getDataValidade() || "Não informada"}${produto.estaVencido() ? " — vencido: venda bloqueada." : ""}`);
    }
    prepararAcaoValidade(codigo, acao) {
        if (!this.podeAcessarAba("estoque")) {
            this.exibirNotificacao("Sem autorização para acessar Estoque.", "erro");
            return;
        }
        document.querySelector('.nav-btn[data-tab="estoque"]')?.click();
        if (acao === "baixa") {
            const produto = this.sistema.buscarProdutoPorCodigo(codigo);
            document.getElementById("mov-produto-codigo").value = codigo;
            document.getElementById("mov-tipo").value = TipoMovimentacao.SAIDA;
            const quantidade = document.getElementById("mov-qtd");
            quantidade.value = String(produto.getQtdEstoque());
            quantidade.focus();
            quantidade.scrollIntoView({ block: "center", behavior: "smooth" });
            this.exibirNotificacao("Confira a quantidade e clique em Registrar Movimentação para confirmar a baixa.");
            return;
        }
        document.getElementById("correcao-validade-produto").value = codigo;
        this.atualizarValidadeAtual();
        const data = document.getElementById("correcao-validade-nova");
        data.value = "";
        document.getElementById("correcao-validade-motivo").value = "";
        data.focus();
        data.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    configurarEventosCompras() {
        document.getElementById("tbody-lista-fornecedores")?.addEventListener("click", evento => {
            const botao = evento.target.closest("button[data-remover-fornecedor]");
            if (!botao)
                return;
            try {
                this.sistema.verificarAcessoModulo(ModuloSistema.COMPRAS);
                if (!window.confirm("Remover este fornecedor das novas operações? Compras anteriores e vínculos históricos serão preservados."))
                    return;
                this.sistema.removerFornecedor(Number(botao.dataset.removerFornecedor));
                this.exibirNotificacao("Fornecedor removido. Histórico preservado.");
            }
            catch (erro) {
                this.exibirNotificacao(erro.message, "erro");
            }
        });
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
        document.getElementById("autorizacao-caixa-modulo")?.addEventListener("change", () => this.renderizarEquipe());
        document.getElementById("form-autorizacao-caixa")?.addEventListener("submit", evento => {
            evento.preventDefault();
            try {
                const alvo = Number(document.getElementById("autorizacao-caixa-funcionario").value);
                const permitir = document.getElementById("autorizacao-caixa-acao").value === "conceder";
                const motivo = document.getElementById("autorizacao-caixa-motivo");
                const modulo = (document.getElementById("autorizacao-caixa-modulo")?.value || ModuloSistema.CAIXA);
                this.sistema.alterarAutorizacao(alvo, modulo, permitir, motivo.value);
                motivo.value = "";
                this.exibirNotificacao(`Autorização para ${this.nomesModulos[modulo]} ${permitir ? "concedida" : "revogada"} e registrada.`);
            }
            catch (erro) {
                this.exibirNotificacao(erro.message, "erro");
            }
        });
        const formCargo = document.getElementById("form-novo-cargo");
        formCargo?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            try {
                const nome = document.getElementById("cargo-nome").value;
                const salario = Number(document.getElementById("cargo-salario").value);
                const permissoes = Array.from(document.querySelectorAll('input[name="cargo-permissoes"]:checked')).map(input => input.value);
                const cargo = this.sistema.cadastrarCargo(nome, salario, permissoes);
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
        this.renderizarNavegacao();
        const aviso = document.getElementById("aviso-persistencia");
        if (aviso) {
            aviso.textContent = this.sistema.getAvisoPersistencia() || "";
            aviso.hidden = !this.sistema.getAvisoPersistencia();
        }
        this.renderizarTopo();
        this.renderizarDashboard();
        this.renderizarPDV();
        this.renderizarEstoque();
        this.renderizarCompras();
        this.renderizarEquipe();
        this.renderizarPermissoesModulos();
    }
    renderizarPermissoesModulos() {
        const formularios = {
            ESTOQUE: ["form-nova-categoria", "form-novo-produto", "form-movimentacao-estoque", "form-corrigir-validade"],
            COMPRAS: ["form-novo-fornecedor", "form-add-item-compra"],
            EQUIPE: ["form-novo-cargo", "form-novo-funcionario"]
        };
        for (const modulo of [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS, ModuloSistema.EQUIPE]) {
            const permitido = this.sistema.getFuncionarioLogado()?.temAcessoModulo(modulo) ?? false;
            const aviso = document.getElementById(`aviso-acesso-${modulo.toLowerCase()}`);
            if (aviso) {
                aviso.hidden = permitido;
                aviso.textContent = `Sem autorização para operar ${this.nomesModulos[modulo]}. Solicite liberação a um gerente em Equipe > Autorizações por módulo. As consultas continuam disponíveis.`;
            }
            for (const id of formularios[modulo]) {
                document.querySelectorAll?.(`#${id} input, #${id} select, #${id} textarea, #${id} button`).forEach(elemento => elemento.disabled = !permitido);
            }
            if (modulo === ModuloSistema.COMPRAS) {
                const finalizar = document.getElementById("btn-finalizar-compra");
                if (finalizar)
                    finalizar.disabled = !permitido;
            }
        }
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
        const sessaoAberta = this.sistema.obterSessaoSelecionada();
        const abaixoMin = this.sistema.listarProdutosAbaixoDoMinimo();
        const vencidos = this.sistema.listarProdutosVencidos();
        this.definirTexto("kpi-total-vendas", this.formatarMoeda(totalVendasValor));
        this.definirTexto("kpi-qtd-vendas", `${vendas.length} venda(s) registrada(s)`);
        this.definirTexto("kpi-saldo-caixa", sessaoAberta ? this.formatarMoeda(sessaoAberta.calcularSaldoEsperado()) : "Selecione um caixa");
        this.definirTexto("kpi-status-sessao", sessaoAberta
            ? `Sessão #${sessaoAberta.getIdSessao()} (Caixa ${sessaoAberta.getCaixa().getNumeroCaixa()})`
            : "Nenhuma sessão selecionada");
        this.definirTexto("kpi-estoque-critico", `${abaixoMin.length} item(ns)`);
        this.definirTexto("kpi-produtos-vencidos", `${vencidos.length} item(ns)`);
        const tbodyAlertas = document.getElementById("tbody-alertas-estoque");
        if (tbodyAlertas) {
            const listaAlertas = this.sistema
                .listarProdutos()
                .filter((p) => p.abaixoDoEstoqueMinimo() || (p.getQtdEstoque() > 0 && p.estaVencido()));
            tbodyAlertas.innerHTML =
                listaAlertas.length === 0
                    ? `<tr><td colspan="7" class="empty-msg">Nenhum alerta de estoque ou validade no momento.</td></tr>`
                    : listaAlertas
                        .map((p) => {
                        const tags = [];
                        if (p.abaixoDoEstoqueMinimo()) {
                            tags.push(`<span class="badge badge-warning">Abaixo do Mínimo</span>`);
                        }
                        if (p.getQtdEstoque() > 0 && p.estaVencido()) {
                            tags.push(`<span class="badge badge-danger">Vencido (${this.escaparHTML(p.getDataValidade())})</span>`);
                        }
                        return `<tr>
                                  <td><code>${this.escaparHTML(p.getCodigoBarras())}</code></td>
                                  <td><strong>${this.escaparHTML(p.getDescricaoProduto())}</strong></td>
                                  <td>${this.escaparHTML(p.getCategoria().getNomeCategoria())}</td>
                                  <td>${p.getQtdEstoque()} ${this.escaparHTML(p.getUnidadeMedida())}</td>
                                  <td>${p.getEstoqueMinimo()} ${this.escaparHTML(p.getUnidadeMedida())}</td>
                                  <td>${tags.join(" ")}</td>
                                  <td>${p.estaVencido() ? this.botoesValidade(p) : "—"}</td>
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
        const sessaoAberta = this.sistema.obterSessaoSelecionada();
        const contexto = `${this.sistema.getFuncionarioLogado()?.getIdFuncionario() ?? ""}:${sessaoAberta?.getIdSessao() ?? ""}`;
        if (this.contextoCarrinho !== null && contexto !== this.contextoCarrinho) {
            this.carrinhoVenda = [];
            this.pagamentosVenda = [];
        }
        this.contextoCarrinho = contexto;
        const seletorSessao = document.getElementById("pdv-sessao-id");
        if (seletorSessao) {
            seletorSessao.innerHTML = '<option value="">Selecione o caixa desta venda</option>' + this.sistema.listarSessoesAcessiveis().map(s => `<option value="${s.getIdSessao()}">Caixa #${s.getCaixa().getNumeroCaixa()} — Sessão #${s.getIdSessao()} — Aberta por ${this.escaparHTML(s.getFuncionario().getNomeFuncionario())}</option>`).join("");
            seletorSessao.value = sessaoAberta ? String(sessaoAberta.getIdSessao()) : "";
        }
        const listaCaixas = document.getElementById("tbody-caixas");
        if (listaCaixas)
            listaCaixas.innerHTML = this.sistema.listarCaixas().map(c => `<tr><td>Caixa #${c.getNumeroCaixa()}</td><td>${this.escaparHTML(c.getStatusCaixa())}</td></tr>`).join("");
        document.querySelectorAll?.("#form-novo-caixa input, #form-novo-caixa button").forEach(el => el.disabled = !this.sistema.getFuncionarioLogado()?.podeOperarCaixa());
        let aviso = "";
        try {
            this.sistema.verificarAcessoCaixa(sessaoAberta?.getIdSessao());
        }
        catch (erro) {
            aviso = erro.message;
        }
        const painelAcesso = document.getElementById("aviso-acesso-caixa");
        if (painelAcesso) {
            painelAcesso.hidden = !aviso && !!sessaoAberta;
            painelAcesso.textContent = aviso || "Selecione uma sessão aberta para a venda ou abra uma sessão em outro caixa disponível.";
        }
        for (const seletor of ["#form-abrir-sessao button", "#form-add-item-venda input", "#form-add-item-venda select", "#form-add-item-venda button", "#form-add-pagamento-venda input", "#form-add-pagamento-venda select", "#form-add-pagamento-venda button", "#form-novo-cliente input", "#form-novo-cliente button", "#btn-finalizar-venda"]) {
            document.querySelectorAll?.(seletor).forEach(elemento => elemento.disabled = !!aviso || (!sessaoAberta && !seletor.startsWith("#form-abrir-sessao") && !seletor.startsWith("#form-novo-cliente")));
        }
        const fechar = document.getElementById("btn-fechar-sessao-atual");
        if (fechar) {
            try {
                this.sistema.verificarAcessoCaixa(sessaoAberta?.getIdSessao(), true);
                fechar.disabled = !sessaoAberta;
            }
            catch {
                fechar.disabled = true;
            }
        }
        const painelAbrir = document.getElementById("painel-abrir-sessao");
        const painelSessaoAtiva = document.getElementById("painel-sessao-ativa");
        if (painelAbrir && painelSessaoAtiva) {
            painelAbrir.style.display = "block";
            painelSessaoAtiva.style.display = sessaoAberta ? "block" : "none";
        }
        const selectCaixa = document.getElementById("sessao-caixa-id");
        if (selectCaixa) {
            const anterior = selectCaixa.value;
            const caixasLivres = this.sistema
                .listarCaixas()
                .filter((c) => c.getStatusCaixa() === StatusCaixa.LIVRE);
            selectCaixa.innerHTML =
                caixasLivres.length === 0
                    ? `<option value="">Nenhum caixa livre</option>`
                    : caixasLivres
                        .map((c) => `<option value="${c.getIdCaixa()}">Caixa #0${c.getNumeroCaixa()} (${c.getStatusCaixa()})</option>`)
                        .join("");
            if (anterior && caixasLivres.some(c => String(c.getIdCaixa()) === anterior))
                selectCaixa.value = anterior;
        }
        if (sessaoAberta) {
            this.definirTexto("info-sessao-atual", `Sessão #${sessaoAberta.getIdSessao()} | Caixa #0${sessaoAberta.getCaixa().getNumeroCaixa()} | Operador: ${sessaoAberta.getFuncionario().getNomeFuncionario()}`);
            this.definirTexto("info-sessao-abertura", sessaoAberta.getDataAbertura());
            this.definirTexto("info-sessao-inicial", this.formatarMoeda(sessaoAberta.getValorInicial()));
            this.definirTexto("info-sessao-vendas", this.formatarMoeda(sessaoAberta.calcularTotalVendas()));
            this.definirTexto("info-sessao-esperado", this.formatarMoeda(sessaoAberta.calcularSaldoEsperado()));
            this.definirTexto("info-sessao-consolidado", this.formatarMoeda(sessaoAberta.calcularSaldoConsolidado()));
            this.definirTexto("info-sessao-digital", this.formatarMoeda(sessaoAberta.calcularTotalDigital()));
        }
        const fechada = this.sistema.listarSessoesCaixa().find(s => !s.estaAberta());
        const painelFechamento = document.getElementById("ultimo-fechamento");
        if (painelFechamento) {
            painelFechamento.hidden = !fechada;
            if (fechada) {
                const esperado = fechada.getEsperadoNoFechamento();
                const conferido = fechada.getValorConferido();
                const diferenca = fechada.calcularDiferencaFechamento();
                painelFechamento.textContent = esperado === undefined
                    ? `Sessão #${fechada.getIdSessao()} — fechamento legado: valor registrado ${this.formatarMoeda(fechada.getValorFinal() || 0)}. Não há conferência física registrada no formato atual.`
                    : `Sessão #${fechada.getIdSessao()} — esperado em dinheiro: ${this.formatarMoeda(esperado)}. ` +
                        (conferido === undefined ? "Contagem não informada; fechamento pelo esperado." :
                            `Conferido: ${this.formatarMoeda(conferido)}. Diferença: ${this.formatarMoeda(diferenca)} (${diferenca > 0 ? "sobra" : diferenca < 0 ? "falta" : "sem diferença"}).`) +
                        (fechada.getIdResponsavelFechamento() === undefined ? " Responsável pelo fechamento não registrado no histórico legado." : ` Fechamento por funcionário #${fechada.getIdResponsavelFechamento()}.`);
            }
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
        const dinheiro = this.pagamentosVenda.filter(p => this.sistema.buscarFormaPagamentoPorId(p.idForma).permiteTroco())
            .reduce((soma, p) => soma + Math.round(p.valorPago * 100), 0) / 100;
        const digital = Number((totalPago - dinheiro).toFixed(2));
        const troco = Math.min(dinheiro, Math.max(0, Number((totalPago - totalVenda).toFixed(2))));
        this.definirTexto("resumo-venda-aviso", Math.round(digital * 100) > Math.round(totalVenda * 100)
            ? "Pagamento digital excede o total. Ajuste PIX/cartões antes de finalizar. Troco somente em dinheiro."
            : "Troco somente sobre o dinheiro recebido.");
        this.definirTexto("resumo-venda-total", this.formatarMoeda(totalVenda));
        this.definirTexto("resumo-venda-pago", this.formatarMoeda(totalPago));
        this.definirTexto("resumo-venda-troco", this.formatarMoeda(troco));
        // Histórico de Vendas e Sessões
        const tbodyHistVendas = document.getElementById("tbody-historico-vendas");
        if (tbodyHistVendas) {
            const vendas = this.sistema.listarVendas();
            tbodyHistVendas.innerHTML =
                vendas.length === 0
                    ? `<tr><td colspan="8" class="empty-msg">Nenhuma venda realizada ainda.</td></tr>`
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
                                  <td>Caixa #${v.getSessaoCaixa().getCaixa().getNumeroCaixa()} (ID ${v.getSessaoCaixa().getCaixa().getIdCaixa()})</td>
                                  <td>Sessão #${v.getSessaoCaixa().getIdSessao()} (${this.escaparHTML(v
                            .getOperadorVenda()
                            .getNomeFuncionario())}${v.getIdOperadorRegistrado() === undefined ? "; responsável da sessão no histórico legado" : ""})<br>Aberta por: ${this.escaparHTML(v.getSessaoCaixa().getFuncionario().getNomeFuncionario())}</td>
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
            const anterior = selectMovProd.value;
            selectMovProd.innerHTML = this.sistema
                .listarProdutos()
                .map((p) => `<option value="${this.escaparHTML(p.getCodigoBarras())}">${this.escaparHTML(p.getDescricaoProduto())} (Atual: ${p.getQtdEstoque()} ${this.escaparHTML(p.getUnidadeMedida())})</option>`)
                .join("");
            if (anterior)
                selectMovProd.value = anterior;
        }
        const selectValidade = document.getElementById("correcao-validade-produto");
        if (selectValidade) {
            const anterior = selectValidade.value;
            selectValidade.innerHTML = '<option value="">Selecione um produto</option>' + this.sistema.listarProdutos()
                .map(p => `<option value="${this.escaparHTML(p.getCodigoBarras())}">${this.escaparHTML(p.getDescricaoProduto())}</option>`).join("");
            selectValidade.value = anterior;
            this.atualizarValidadeAtual();
        }
        const historico = document.getElementById("tbody-correcoes-validade");
        if (historico)
            historico.innerHTML = this.sistema.listarCorrecoesValidade().map(c => `<tr>
            <td>${this.escaparHTML(new Date(c.dataHora).toLocaleString("pt-BR"))}</td>
            <td>${this.escaparHTML(c.descricaoProduto)} (${this.escaparHTML(c.codigoBarras)})</td>
            <td>${this.escaparHTML(c.validadeAnterior || "Não informada")}</td><td>${this.escaparHTML(c.novaValidade)}</td>
            <td>${this.escaparHTML(c.motivo)}</td><td>${this.escaparHTML(c.nomeFuncionario)} (#${c.idFuncionario})</td>
            </tr>`).join("") || '<tr><td colspan="6" class="empty-msg">Nenhuma correção de validade registrada.</td></tr>';
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
                const validadeStr = p.getQtdEstoque() === 0 ? "---" : p.getDataValidade()
                    ? p.estaVencido()
                        ? `<span class="badge badge-danger">Vencido: ${this.escaparHTML(p.getDataValidade())}</span>`
                        : this.escaparHTML(p.getDataValidade())
                    : "Não perecível";
                const forns = p
                    .getFornecedores()
                    .map((f) => f.getRazaoSocial() + (f.estaAtivo() ? "" : " (removido)"))
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
                        <td>${this.botoesValidade(p)} <button type="button" class="btn btn-danger" data-remover-produto="${this.escaparHTML(p.getCodigoBarras())}">Remover</button></td>
                    </tr>`;
            })
                .join("") || '<tr><td colspan="9" class="empty-msg">Nenhum produto encontrado. Ajuste a busca ou o filtro.</td></tr>';
        }
        const removidos = document.getElementById("tbody-produtos-removidos");
        if (removidos)
            removidos.innerHTML = this.linhasRemocoes("PRODUTO");
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
                        <td><button type="button" class="btn btn-danger" data-remover-fornecedor="${f.getIdFornecedor()}">Remover</button></td>
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
        const removidos = document.getElementById("tbody-fornecedores-removidos");
        if (removidos)
            removidos.innerHTML = this.linhasRemocoes("FORNECEDOR");
    }
    linhasRemocoes(tipo) {
        return this.sistema.listarRemocoes().filter(r => r.tipo === tipo).map(r => `<tr><td>${this.escaparHTML(r.descricao)} (${this.escaparHTML(r.referencia)})</td><td>${this.escaparHTML(new Date(r.dataHora).toLocaleString("pt-BR"))}</td><td>${this.escaparHTML(r.nomeFuncionario)} (#${r.idFuncionario})</td></tr>`).join("") || '<tr><td colspan="3" class="empty-msg">Nenhuma remoção registrada.</td></tr>';
    }
    renderizarEquipe() {
        const gerente = this.sistema.getFuncionarioLogado()?.ehGerente() ?? false;
        const modulo = (document.getElementById("autorizacao-caixa-modulo")?.value || ModuloSistema.CAIXA);
        this.definirTexto("aviso-autorizacao-caixa", gerente ? `Você pode conceder ou revogar acesso individual a ${this.nomesModulos[modulo]}. Permissões herdadas do cargo são indicadas no quadro e não são revogadas por esta ação.` : "Selecione um gerente no topo para alterar autorizações.");
        const salvar = document.getElementById("btn-salvar-autorizacao-caixa");
        if (salvar)
            salvar.disabled = !gerente;
        const selectAlvo = document.getElementById("autorizacao-caixa-funcionario");
        if (selectAlvo) {
            const anterior = selectAlvo.value;
            selectAlvo.innerHTML = '<option value="">Selecione um funcionário</option>' + this.sistema.listarFuncionarios().filter(f => !f.ehGerente() && !f.getCargo().permite(modulo)).map(f => `<option value="${f.getIdFuncionario()}">${this.escaparHTML(f.getNomeFuncionario())} — ${this.escaparHTML(f.getCargo().getNomeCargo())} (${f.temAutorizacaoModulo(modulo) ? "autorização individual" : "sem autorização"})</option>`).join("");
            selectAlvo.value = anterior;
        }
        const historico = document.getElementById("tbody-autorizacoes-caixa");
        if (historico)
            historico.innerHTML = this.sistema.listarAutorizacoes().map(r => `<tr><td>${this.escaparHTML(new Date(r.dataHora).toLocaleString("pt-BR"))}</td><td>${this.nomesModulos[r.modulo]}</td><td>${this.escaparHTML(r.nomeFuncionario)} (#${r.idFuncionario})</td><td>${r.antes ? "Autorizado" : "Sem autorização"} → ${r.depois ? "Autorizado" : "Sem autorização"}</td><td>${this.escaparHTML(r.nomeGerente)} (#${r.idGerente})</td><td>${this.escaparHTML(r.motivo)}</td></tr>`).join("") || '<tr><td colspan="6" class="empty-msg">Nenhuma autorização registrada.</td></tr>';
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
                        <td>${Object.values(ModuloSistema).map(m => `${this.nomesModulos[m]}: ${f.ehGerente() ? "Gerente" : f.getCargo().permite(m) ? "Cargo" : f.temAutorizacaoModulo(m) ? "Individual" : "Sem acesso"}`).join("<br>")}</td>
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
