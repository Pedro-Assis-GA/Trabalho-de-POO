import { Caixa, Cargo, Categoria, Cliente, FormaPagamento, Fornecedor, Funcionario, StatusCaixa, TipoMovimentacao } from "../modelos/Entidades.js";
import { Compra, MovimentacaoEstoque, Produto } from "../modelos/EstoqueECompras.js";
import { SessaoCaixa, Venda } from "../modelos/CaixaEVendas.js";
export class GerenciadorSistema {
    constructor(carregarDadosPadrao = true) {
        this.categorias = [];
        this.cargos = [];
        this.funcionarios = [];
        this.fornecedores = [];
        this.produtos = [];
        this.compras = [];
        this.movimentacoes = [];
        this.caixas = [];
        this.sessoesCaixa = [];
        this.clientes = [];
        this.formasPagamento = [];
        this.vendas = [];
        this.funcionarioLogado = null;
        this.observadores = [];
        this.chaveStorage = "sistema_comercio_poo_v1";
        if (carregarDadosPadrao) {
            const carregouDoStorage = this.carregarEstado();
            if (!carregouDoStorage) {
                this.resetarDadosParaPadrao();
            }
        }
    }
    adicionarObservador(obs) {
        this.observadores.push(obs);
    }
    notificar(evento, dados) {
        this.salvarEstado();
        for (const obs of this.observadores) {
            obs.atualizar(evento, dados);
        }
    }
    formatarDataHoraAtual() {
        const agora = new Date();
        const data = agora.toLocaleDateString("pt-BR");
        const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return `${data} ${hora}`;
    }
    // ==================== AUTENTICAÇÃO E OPERADOR ATIVO ====================
    autenticarFuncionario(idFuncionario, senha) {
        const func = this.buscarFuncionarioPorId(idFuncionario);
        if (!func.autenticar(senha)) {
            throw new Error("Senha incorreta para o funcionário selecionado.");
        }
        this.funcionarioLogado = func;
        this.notificar("FUNCIONARIO_AUTENTICADO", func);
        return func;
    }
    definirFuncionarioAtivo(idFuncionario) {
        const func = this.buscarFuncionarioPorId(idFuncionario);
        this.funcionarioLogado = func;
        this.notificar("FUNCIONARIO_ALTERADO", func);
        return func;
    }
    getFuncionarioLogado() {
        return this.funcionarioLogado;
    }
    // ==================== CATEGORIAS ====================
    cadastrarCategoria(nomeCategoria) {
        const novoId = this.gerarProximoId(this.categorias.map((c) => c.getIdCategoria()));
        const nova = new Categoria(novoId, nomeCategoria);
        this.categorias.push(nova);
        this.notificar("CATEGORIA_CADASTRADA", nova);
        return nova;
    }
    listarCategorias() {
        return [...this.categorias];
    }
    buscarCategoriaPorId(idCategoria) {
        const cat = this.categorias.find((c) => c.getIdCategoria() === idCategoria);
        if (!cat) {
            throw new Error(`Categoria ID ${idCategoria} não encontrada.`);
        }
        return cat;
    }
    // ==================== CARGOS E FUNCIONÁRIOS ====================
    cadastrarCargo(nomeCargo, salarioBase) {
        const novoId = this.gerarProximoId(this.cargos.map((c) => c.getIdCargo()));
        const novo = new Cargo(novoId, nomeCargo, salarioBase);
        this.cargos.push(novo);
        this.notificar("CARGO_CADASTRADO", novo);
        return novo;
    }
    listarCargos() {
        return [...this.cargos];
    }
    buscarCargoPorId(idCargo) {
        const cargo = this.cargos.find((c) => c.getIdCargo() === idCargo);
        if (!cargo) {
            throw new Error(`Cargo ID ${idCargo} não encontrado.`);
        }
        return cargo;
    }
    cadastrarFuncionario(cpf, nome, senha, dataAdmissao, idCargo, telefones) {
        const cargo = this.buscarCargoPorId(idCargo);
        const novoId = this.gerarProximoId(this.funcionarios.map((f) => f.getIdFuncionario()));
        const func = new Funcionario(novoId, cpf, nome, senha, dataAdmissao, cargo, telefones);
        this.funcionarios.push(func);
        if (!this.funcionarioLogado) {
            this.funcionarioLogado = func;
        }
        this.notificar("FUNCIONARIO_CADASTRADO", func);
        return func;
    }
    listarFuncionarios() {
        return [...this.funcionarios];
    }
    buscarFuncionarioPorId(idFuncionario) {
        const func = this.funcionarios.find((f) => f.getIdFuncionario() === idFuncionario);
        if (!func) {
            throw new Error(`Funcionário ID ${idFuncionario} não encontrado.`);
        }
        return func;
    }
    obterRastreabilidadeFuncionario(idFuncionario) {
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const sessoesCaixa = this.sessoesCaixa.filter((s) => s.getFuncionario().getIdFuncionario() === idFuncionario);
        const comprasRegistradas = this.compras.filter((c) => c.getFuncionarioResponsavel().getIdFuncionario() === idFuncionario);
        const movimentacoesEstoque = this.movimentacoes.filter((m) => m.getFuncionarioResponsavel().getIdFuncionario() === idFuncionario);
        return {
            funcionario,
            sessoesCaixa,
            comprasRegistradas,
            movimentacoesEstoque
        };
    }
    // ==================== FORNECEDORES ====================
    cadastrarFornecedor(cnpj, razaoSocial, email, telefones) {
        const novoId = this.gerarProximoId(this.fornecedores.map((f) => f.getIdFornecedor()));
        const forn = new Fornecedor(novoId, cnpj, razaoSocial, email, telefones);
        this.fornecedores.push(forn);
        this.notificar("FORNECEDOR_CADASTRADO", forn);
        return forn;
    }
    listarFornecedores() {
        return [...this.fornecedores];
    }
    buscarFornecedorPorId(idFornecedor) {
        const forn = this.fornecedores.find((f) => f.getIdFornecedor() === idFornecedor);
        if (!forn) {
            throw new Error(`Fornecedor ID ${idFornecedor} não encontrado.`);
        }
        return forn;
    }
    // ==================== PRODUTOS E ESTOQUE ====================
    cadastrarProduto(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoqueInicial, estoqueMinimo, idCategoria, dataValidade, idsFornecedores = [], idFuncionarioResponsavel) {
        const existente = this.produtos.find((p) => p.getCodigoBarras() === codigoBarras.trim());
        if (existente) {
            throw new Error(`Já existe um produto com o código de barras "${codigoBarras}".`);
        }
        const categoria = this.buscarCategoriaPorId(idCategoria);
        const fornecedores = idsFornecedores.map((id) => this.buscarFornecedorPorId(id));
        const produto = new Produto(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoqueInicial, estoqueMinimo, categoria, dataValidade, fornecedores);
        this.produtos.push(produto);
        if (qtdEstoqueInicial > 0) {
            const responsavel = idFuncionarioResponsavel
                ? this.buscarFuncionarioPorId(idFuncionarioResponsavel)
                : this.funcionarioLogado || this.funcionarios[0];
            if (responsavel) {
                this.registrarMovimentacaoInterna(TipoMovimentacao.ENTRADA, qtdEstoqueInicial, produto, responsavel);
            }
        }
        this.notificar("PRODUTO_CADASTRADO", produto);
        return produto;
    }
    listarProdutos() {
        return [...this.produtos];
    }
    buscarProdutoPorCodigo(codigoBarras) {
        const prod = this.produtos.find((p) => p.getCodigoBarras() === codigoBarras.trim());
        if (!prod) {
            throw new Error(`Produto com código de barras "${codigoBarras}" não encontrado.`);
        }
        return prod;
    }
    listarProdutosAbaixoDoMinimo() {
        return this.produtos.filter((p) => p.abaixoDoEstoqueMinimo());
    }
    listarProdutosVencidos() {
        return this.produtos.filter((p) => p.estaVencido());
    }
    realizarAjusteEstoque(codigoBarras, tipo, quantidade, idFuncionario) {
        if (!Object.values(TipoMovimentacao).includes(tipo) || !Number.isFinite(quantidade)) {
            throw new Error("Tipo de movimentação ou quantidade inválida.");
        }
        const produto = this.buscarProdutoPorCodigo(codigoBarras);
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        if (tipo === TipoMovimentacao.ENTRADA) {
            produto.adicionarEstoque(quantidade);
        }
        else if (tipo === TipoMovimentacao.SAIDA) {
            produto.removerEstoque(quantidade);
        }
        else if (tipo === TipoMovimentacao.AJUSTE) {
            produto.definirEstoquePorAjuste(quantidade);
        }
        const mov = this.registrarMovimentacaoInterna(tipo, quantidade, produto, funcionario);
        this.notificar("ESTOQUE_MOVIMENTADO", mov);
        return mov;
    }
    listarMovimentacoesEstoque() {
        return [...this.movimentacoes];
    }
    registrarMovimentacaoInterna(tipo, quantidade, produto, funcionario) {
        const novoId = this.gerarProximoId(this.movimentacoes.map((m) => m.getIdMovimentacao()));
        const mov = new MovimentacaoEstoque(novoId, this.formatarDataHoraAtual(), tipo, quantidade, produto, funcionario);
        this.movimentacoes.unshift(mov);
        return mov;
    }
    // ==================== COMPRAS DE FORNECEDORES ====================
    registrarCompra(idFornecedor, idFuncionario, itensInput, dataCompra = this.formatarDataHoraAtual()) {
        if (!itensInput || itensInput.length === 0) {
            throw new Error("A compra precisa ter ao menos um produto.");
        }
        const fornecedor = this.buscarFornecedorPorId(idFornecedor);
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const novoId = this.gerarProximoId(this.compras.map((c) => c.getIdCompra()));
        const compra = new Compra(novoId, dataCompra, fornecedor, funcionario);
        for (const item of itensInput) {
            const produto = this.buscarProdutoPorCodigo(item.codigoBarras);
            compra.adicionarItem(produto, item.qtdCompra, item.custoUnitario);
        }
        // Valide toda a nota antes de alterar estoque, custos e rastreabilidade.
        for (const item of compra.getItens()) {
            const produto = item.getProduto();
            produto.adicionarEstoque(item.getQtdCompra());
            produto.setCustoProduto(item.getCustoUnitario());
            produto.vincularFornecedor(fornecedor);
            this.registrarMovimentacaoInterna(TipoMovimentacao.ENTRADA, item.getQtdCompra(), produto, funcionario);
        }
        this.compras.unshift(compra);
        this.notificar("COMPRA_REGISTRADA", compra);
        return compra;
    }
    listarCompras() {
        return [...this.compras];
    }
    // ==================== CAIXAS E SESSÕES DE CAIXA ====================
    cadastrarCaixa(numeroCaixa) {
        if (this.caixas.some((c) => c.getNumeroCaixa() === numeroCaixa)) {
            throw new Error(`Já existe um caixa de número ${numeroCaixa}.`);
        }
        const novoId = this.gerarProximoId(this.caixas.map((c) => c.getIdCaixa()));
        const caixa = new Caixa(novoId, numeroCaixa, StatusCaixa.LIVRE);
        this.caixas.push(caixa);
        this.notificar("CAIXA_CADASTRADO", caixa);
        return caixa;
    }
    listarCaixas() {
        return [...this.caixas];
    }
    buscarCaixaPorId(idCaixa) {
        const caixa = this.caixas.find((c) => c.getIdCaixa() === idCaixa);
        if (!caixa) {
            throw new Error(`Caixa ID ${idCaixa} não encontrado.`);
        }
        return caixa;
    }
    abrirSessaoCaixa(idCaixa, idFuncionario, valorInicial) {
        const caixa = this.buscarCaixaPorId(idCaixa);
        if (caixa.getStatusCaixa() !== StatusCaixa.LIVRE) {
            throw new Error(`O Caixa #${caixa.getNumeroCaixa()} não está livre (${caixa.getStatusCaixa()}).`);
        }
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const novoId = this.gerarProximoId(this.sessoesCaixa.map((s) => s.getIdSessao()));
        const sessao = new SessaoCaixa(novoId, this.formatarDataHoraAtual(), valorInicial, funcionario, caixa);
        this.sessoesCaixa.unshift(sessao);
        this.notificar("SESSAO_ABERTA", sessao);
        return sessao;
    }
    fecharSessaoCaixa(idSessao, valorFinalConferido) {
        const sessao = this.buscarSessaoPorId(idSessao);
        sessao.fecharSessao(this.formatarDataHoraAtual(), valorFinalConferido);
        this.notificar("SESSAO_FECHADA", sessao);
        return sessao;
    }
    obterSessaoAbertaAtual() {
        return this.sessoesCaixa.find((s) => s.estaAberta());
    }
    listarSessoesCaixa() {
        return [...this.sessoesCaixa];
    }
    buscarSessaoPorId(idSessao) {
        const sessao = this.sessoesCaixa.find((s) => s.getIdSessao() === idSessao);
        if (!sessao) {
            throw new Error(`Sessão de Caixa ID ${idSessao} não encontrada.`);
        }
        return sessao;
    }
    // ==================== CLIENTES E FORMAS DE PAGAMENTO ====================
    cadastrarCliente(nome, telefone, cpf) {
        const novoId = this.gerarProximoId(this.clientes.map((c) => c.getIdCliente()));
        const cliente = new Cliente(novoId, nome, telefone, cpf);
        this.clientes.push(cliente);
        this.notificar("CLIENTE_CADASTRADO", cliente);
        return cliente;
    }
    listarClientes() {
        return [...this.clientes];
    }
    buscarClientePorId(idCliente) {
        const cli = this.clientes.find((c) => c.getIdCliente() === idCliente);
        if (!cli) {
            throw new Error(`Cliente ID ${idCliente} não encontrado.`);
        }
        return cli;
    }
    listarFormasPagamento() {
        return [...this.formasPagamento];
    }
    buscarFormaPagamentoPorId(idForma) {
        const forma = this.formasPagamento.find((f) => f.getIdForma() === idForma);
        if (!forma) {
            throw new Error(`Forma de Pagamento ID ${idForma} não encontrada.`);
        }
        return forma;
    }
    // ==================== VENDAS (FRENTE DE CAIXA / PDV) ====================
    registrarVenda(idSessao, itensInput, pagamentosInput, idCliente) {
        const sessao = this.buscarSessaoPorId(idSessao);
        if (!sessao.estaAberta()) {
            throw new Error("A sessão de caixa informada está fechada. Abra uma sessão antes de vender.");
        }
        const cliente = idCliente ? this.buscarClientePorId(idCliente) : undefined;
        const novoId = this.gerarProximoId(this.vendas.map((v) => v.getIdVenda()));
        const venda = new Venda(novoId, this.formatarDataHoraAtual(), sessao, cliente);
        for (const item of itensInput) {
            const produto = this.buscarProdutoPorCodigo(item.codigoBarras);
            venda.adicionarItem(produto, item.qtdVenda);
        }
        for (const pag of pagamentosInput) {
            const forma = this.buscarFormaPagamentoPorId(pag.idForma);
            venda.adicionarPagamento(forma, pag.valorPago);
        }
        venda.validarVendaParaFinalizacao();
        // Baixar estoque e gerar movimentações de SAIDA vinculadas ao operador da sessão
        const operador = sessao.getFuncionario();
        for (const item of venda.getItens()) {
            const prod = item.getProduto();
            prod.removerEstoque(item.getQtdVenda());
            this.registrarMovimentacaoInterna(TipoMovimentacao.SAIDA, item.getQtdVenda(), prod, operador);
        }
        sessao.vincularVenda(venda);
        this.vendas.unshift(venda);
        this.notificar("VENDA_REALIZADA", venda);
        return venda;
    }
    listarVendas() {
        return [...this.vendas];
    }
    resetarDadosParaPadrao() {
        this.categorias = [];
        this.cargos = [];
        this.funcionarios = [];
        this.fornecedores = [];
        this.produtos = [];
        this.compras = [];
        this.movimentacoes = [];
        this.caixas = [];
        this.sessoesCaixa = [];
        this.clientes = [];
        this.formasPagamento = [];
        this.vendas = [];
        this.funcionarioLogado = null;
        this.popularDadosIniciais();
        this.notificar("SISTEMA_RESETADO");
    }
    gerarProximoId(ids) {
        if (ids.length === 0)
            return 1;
        return Math.max(...ids) + 1;
    }
    // ==================== DADOS INICIAIS DE DEMONSTRAÇÃO ====================
    popularDadosIniciais() {
        const catMercearia = new Categoria(1, "Mercearia e Grãos");
        const catLaticinios = new Categoria(2, "Laticínios e Frios");
        const catBebidas = new Categoria(3, "Bebidas");
        const catLimpeza = new Categoria(4, "Higiene e Limpeza");
        this.categorias.push(catMercearia, catLaticinios, catBebidas, catLimpeza);
        const cargoGerente = new Cargo(1, "Gerente Geral", 4200.0);
        const cargoCaixa = new Cargo(2, "Operador de Caixa", 2150.0);
        const cargoEstoquista = new Cargo(3, "Auxiliar de Estoque", 2250.0);
        this.cargos.push(cargoGerente, cargoCaixa, cargoEstoquista);
        const funcGerente = new Funcionario(1, "412.885.190-01", "Carlos Mendes", "1234", "2025-02-10", cargoGerente, ["(19) 99811-2233", "(19) 3456-7890"]);
        const funcCaixa = new Funcionario(2, "329.741.608-55", "Fernanda Oliveira", "1234", "2025-03-15", cargoCaixa, ["(19) 99722-3344"]);
        const funcEstoquista = new Funcionario(3, "518.902.314-22", "Roberto Santos", "1234", "2025-04-01", cargoEstoquista, ["(19) 99633-4455"]);
        this.funcionarios.push(funcGerente, funcCaixa, funcEstoquista);
        this.funcionarioLogado = funcGerente;
        const fornAlimentos = new Fornecedor(1, "12.345.678/0001-90", "Distribuidora Paulista de Alimentos Ltda", "vendas@distribuidorapaulista.com.br", ["(11) 4002-8922", "(11) 98877-6655"]);
        const fornLaticinios = new Fornecedor(2, "98.765.432/0001-10", "Laticínios Vale Verde S.A.", "contato@valeverde.com.br", ["(19) 3322-1100"]);
        this.fornecedores.push(fornAlimentos, fornLaticinios);
        const pArroz = new Produto("7891000100101", "Arroz Tipo 1 Pacote 5kg", 28.9, 21.5, "UN", 25, 10, catMercearia, "2027-08-15", [fornAlimentos]);
        const pFeijao = new Produto("7891000100202", "Feijão Carioca 1kg", 8.5, 5.9, "UN", 6, 12, catMercearia, "2027-05-20", [fornAlimentos]);
        const pLeite = new Produto("7891000200303", "Leite Integral UHT 1L", 5.49, 3.8, "UN", 42, 15, catLaticinios, "2027-01-10", [fornLaticinios]);
        const pIogurte = new Produto("7891000200404", "Iogurte Natural Refrigerado 170g", 3.99, 2.4, "UN", 4, 8, catLaticinios, "2026-10-01", [fornLaticinios]);
        const pDetergente = new Produto("7891000400505", "Detergente Neutro 500ml", 2.79, 1.65, "UN", 30, 10, catLimpeza, undefined, [fornAlimentos]);
        this.produtos.push(pArroz, pFeijao, pLeite, pIogurte, pDetergente);
        this.formasPagamento.push(new FormaPagamento(1, "Dinheiro"), new FormaPagamento(2, "PIX"), new FormaPagamento(3, "Cartão de Débito"), new FormaPagamento(4, "Cartão de Crédito"));
        const caixa1 = new Caixa(1, 1, StatusCaixa.LIVRE);
        const caixa2 = new Caixa(2, 2, StatusCaixa.LIVRE);
        const caixa3 = new Caixa(3, 3, StatusCaixa.MANUTENCAO);
        this.caixas.push(caixa1, caixa2, caixa3);
        const cli1 = new Cliente(1, "Ana Clara Souza", "(19) 99111-2222", "123.456.789-00");
        const cli2 = new Cliente(2, "Carlos Alberto Lima", "(19) 99333-4444", "234.567.890-11");
        this.clientes.push(cli1, cli2);
        // Registrar uma compra inicial e uma sessão de caixa aberta com 1 venda de exemplo
        this.registrarCompra(1, 3, [
            { codigoBarras: "7891000100101", qtdCompra: 5, custoUnitario: 21.5 },
            { codigoBarras: "7891000400505", qtdCompra: 10, custoUnitario: 1.65 }
        ], "09/11/2026 08:30");
        const sessaoDemo = this.abrirSessaoCaixa(1, 2, 150.0);
        this.registrarVenda(sessaoDemo.getIdSessao(), [
            { codigoBarras: "7891000100101", qtdVenda: 1 },
            { codigoBarras: "7891000200303", qtdVenda: 2 }
        ], [
            { idForma: 1, valorPago: 20.0 },
            { idForma: 2, valorPago: 19.88 }
        ], 1);
    }
    // ==================== PERSISTÊNCIA EM MEMÓRIA / LOCALSTORAGE ====================
    salvarEstado() {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
            return;
        }
        try {
            const payload = {
                funcionarioAtivoId: this.funcionarioLogado?.getIdFuncionario(),
                categorias: this.categorias.map((c) => ({
                    idCategoria: c.getIdCategoria(),
                    nomeCategoria: c.getNomeCategoria()
                })),
                cargos: this.cargos.map((c) => ({
                    idCargo: c.getIdCargo(),
                    nomeCargo: c.getNomeCargo(),
                    salarioBase: c.getSalarioBase()
                })),
                funcionarios: this.funcionarios.map((f) => ({
                    idFuncionario: f.getIdFuncionario(),
                    cpfFuncionario: f.getCpfFuncionario(),
                    nomeFuncionario: f.getNomeFuncionario(),
                    senha: f.getSenha(),
                    dataAdmissao: f.getDataAdmissao(),
                    idCargo: f.getCargo().getIdCargo(),
                    telefones: f.getTelefones()
                })),
                fornecedores: this.fornecedores.map((f) => ({
                    idFornecedor: f.getIdFornecedor(),
                    cnpj: f.getCnpj(),
                    razaoSocial: f.getRazaoSocial(),
                    email: f.getEmail(),
                    telefones: f.getTelefones()
                })),
                produtos: this.produtos.map((p) => ({
                    codigoBarras: p.getCodigoBarras(),
                    descricaoProduto: p.getDescricaoProduto(),
                    precoVenda: p.getPrecoVenda(),
                    custoProduto: p.getCustoProduto(),
                    unidadeMedida: p.getUnidadeMedida(),
                    qtdEstoque: p.getQtdEstoque(),
                    estoqueMinimo: p.getEstoqueMinimo(),
                    dataValidade: p.getDataValidade(),
                    idCategoria: p.getCategoria().getIdCategoria(),
                    idsFornecedores: p.getFornecedores().map((f) => f.getIdFornecedor())
                })),
                caixas: this.caixas.map((c) => ({
                    idCaixa: c.getIdCaixa(),
                    numeroCaixa: c.getNumeroCaixa(),
                    statusCaixa: c.getStatusCaixa()
                })),
                clientes: this.clientes.map((c) => ({
                    idCliente: c.getIdCliente(),
                    nomeCliente: c.getNomeCliente(),
                    telefoneCliente: c.getTelefoneCliente(),
                    cpfCliente: c.getCpfCliente()
                })),
                formasPagamento: this.formasPagamento.map((f) => ({
                    idForma: f.getIdForma(),
                    descricao: f.getDescricao()
                })),
                compras: this.compras.map((c) => ({
                    idCompra: c.getIdCompra(),
                    dataCompra: c.getDataCompra(),
                    idFornecedor: c.getFornecedor().getIdFornecedor(),
                    idFuncionario: c.getFuncionarioResponsavel().getIdFuncionario(),
                    itens: c.getItens().map((i) => ({
                        codigoBarras: i.getCodigoBarras(),
                        qtdCompra: i.getQtdCompra(),
                        custoUnitario: i.getCustoUnitario()
                    }))
                })),
                movimentacoes: this.movimentacoes.map((m) => ({
                    idMovimentacao: m.getIdMovimentacao(),
                    dataHoraMov: m.getDataHoraMov(),
                    tipo: m.getTipo(),
                    qtdMovimentacao: m.getQtdMovimentacao(),
                    codigoBarras: m.getCodigoBarras(),
                    idFuncionario: m.getFuncionarioResponsavel().getIdFuncionario()
                })),
                sessoesCaixa: this.sessoesCaixa.map((s) => ({
                    idSessao: s.getIdSessao(),
                    dataAbertura: s.getDataAbertura(),
                    dataFechamento: s.getDataFechamento(),
                    valorInicial: s.getValorInicial(),
                    valorFinal: s.getValorFinal(),
                    idFuncionario: s.getFuncionario().getIdFuncionario(),
                    idCaixa: s.getCaixa().getIdCaixa()
                })),
                vendas: this.vendas.map((v) => ({
                    idVenda: v.getIdVenda(),
                    dataHoraVenda: v.getDataHoraVenda(),
                    idSessao: v.getSessaoCaixa().getIdSessao(),
                    idCliente: v.getCliente()?.getIdCliente(),
                    itens: v.getItens().map((i) => ({
                        codigoBarras: i.getCodigoBarras(),
                        qtdVenda: i.getQtdVenda(),
                        precoUnitario: i.getPrecoUnitario()
                    })),
                    pagamentos: v.getPagamentos().map((p) => ({
                        idForma: p.getIdForma(),
                        valorPago: p.getValorPago()
                    }))
                }))
            };
            globalThis.localStorage.setItem(this.chaveStorage, JSON.stringify(payload));
        }
        catch {
            // Ignora falha de storage em ambientes restritos
        }
    }
    carregarEstado() {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
            return false;
        }
        try {
            const bruto = globalThis.localStorage.getItem(this.chaveStorage);
            if (!bruto)
                return false;
            const dados = JSON.parse(bruto);
            this.categorias = dados.categorias.map((c) => new Categoria(c.idCategoria, c.nomeCategoria));
            this.cargos = dados.cargos.map((c) => new Cargo(c.idCargo, c.nomeCargo, c.salarioBase));
            this.funcionarios = dados.funcionarios.map((f) => new Funcionario(f.idFuncionario, f.cpfFuncionario, f.nomeFuncionario, f.senha, f.dataAdmissao, this.buscarCargoPorId(f.idCargo), f.telefones));
            this.funcionarioLogado = this.funcionarios.find(f => f.getIdFuncionario() === dados.funcionarioAtivoId) || this.funcionarios[0] || null;
            this.fornecedores = dados.fornecedores.map((f) => new Fornecedor(f.idFornecedor, f.cnpj, f.razaoSocial, f.email, f.telefones));
            this.produtos = dados.produtos.map((p) => new Produto(p.codigoBarras, p.descricaoProduto, p.precoVenda, p.custoProduto, p.unidadeMedida, p.qtdEstoque, p.estoqueMinimo, this.buscarCategoriaPorId(p.idCategoria), p.dataValidade, (p.idsFornecedores || []).map((id) => this.buscarFornecedorPorId(id))));
            this.caixas = dados.caixas.map((c) => new Caixa(c.idCaixa, c.numeroCaixa, c.statusCaixa));
            this.clientes = dados.clientes.map((c) => new Cliente(c.idCliente, c.nomeCliente, c.telefoneCliente, c.cpfCliente));
            this.formasPagamento = dados.formasPagamento.map((f) => new FormaPagamento(f.idForma, f.descricao));
            this.compras = dados.compras.map((c) => {
                const compra = new Compra(c.idCompra, c.dataCompra, this.buscarFornecedorPorId(c.idFornecedor), this.buscarFuncionarioPorId(c.idFuncionario));
                for (const item of c.itens) {
                    compra.adicionarItem(this.buscarProdutoPorCodigo(item.codigoBarras), item.qtdCompra, item.custoUnitario);
                }
                return compra;
            });
            this.movimentacoes = dados.movimentacoes.map((m) => new MovimentacaoEstoque(m.idMovimentacao, m.dataHoraMov, m.tipo, m.qtdMovimentacao, this.buscarProdutoPorCodigo(m.codigoBarras), this.buscarFuncionarioPorId(m.idFuncionario)));
            this.sessoesCaixa = dados.sessoesCaixa.map((s) => {
                const sessao = new SessaoCaixa(s.idSessao, s.dataAbertura, s.valorInicial, this.buscarFuncionarioPorId(s.idFuncionario), this.buscarCaixaPorId(s.idCaixa));
                sessao.restaurarFechamento(s.dataFechamento, s.valorFinal);
                return sessao;
            });
            this.vendas = dados.vendas.map((v) => {
                const sessao = this.buscarSessaoPorId(v.idSessao);
                const cli = v.idCliente ? this.buscarClientePorId(v.idCliente) : undefined;
                const venda = new Venda(v.idVenda, v.dataHoraVenda, sessao, cli);
                for (const i of v.itens) {
                    venda.adicionarItemSemValidarEstoque(this.buscarProdutoPorCodigo(i.codigoBarras), i.qtdVenda, i.precoUnitario);
                }
                for (const p of v.pagamentos) {
                    venda.adicionarPagamento(this.buscarFormaPagamentoPorId(p.idForma), p.valorPago);
                }
                sessao.restaurarVenda(venda);
                return venda;
            });
            // A ordem histórica de sessões não pode sobrescrever o estado atual do caixa.
            for (const caixa of this.caixas) {
                const ocupada = this.sessoesCaixa.some(s => s.estaAberta() && s.getCaixa() === caixa);
                if (ocupada)
                    caixa.setStatusCaixa(StatusCaixa.OCUPADO);
            }
            return true;
        }
        catch {
            return false;
        }
    }
}
