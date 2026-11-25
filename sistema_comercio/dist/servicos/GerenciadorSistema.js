import { Caixa, Documento, ModuloSistema, Cargo, Categoria, Cliente, FormaPagamento, Fornecedor, Funcionario, StatusCaixa, TipoMovimentacao } from "../modelos/Entidades.js";
import { Compra, CorrecaoValidade, MovimentacaoEstoque, Produto } from "../modelos/EstoqueECompras.js";
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
        this.correcoesValidade = [];
        this.autorizacoesCaixa = [];
        this.inicializandoDemo = false;
        this.remocoes = [];
        this.sessoesSelecionadas = {};
        this.caixas = [];
        this.sessoesCaixa = [];
        this.clientes = [];
        this.formasPagamento = [];
        this.vendas = [];
        this.funcionarioLogado = null;
        this.observadores = [];
        this.avisoPersistencia = null;
        this.estadoCorrompido = false;
        this.conflitoPersistencia = false;
        this.chaveStorage = "sistema_comercio_poo_v1";
        if (carregarDadosPadrao) {
            const carregouDoStorage = this.carregarEstado();
            if (!carregouDoStorage) {
                this.resetarDadosParaPadrao(false);
            }
        }
    }
    getAvisoPersistencia() { return this.avisoPersistencia; }
    verificarConcorrencia() {
        if (this.conflitoPersistencia)
            throw new Error("Há alterações em outra aba. Recarregue antes de continuar.");
        if (this.ultimoEstadoPersistido === undefined)
            return;
        try {
            if (globalThis.localStorage.getItem(this.chaveStorage) !== this.ultimoEstadoPersistido) {
                this.conflitoPersistencia = true;
            }
        }
        catch {
            this.avisoPersistencia = "Não foi possível conferir os dados no armazenamento. Esta operação foi bloqueada para preservar o último estado salvo. Tente novamente após recuperar o acesso.";
            for (const obs of this.observadores)
                obs.atualizar("LEITURA_PERSISTENCIA_INDISPONIVEL");
            throw new Error(this.avisoPersistencia);
        }
        if (this.conflitoPersistencia) {
            this.avisoPersistencia = "Conflito: outra aba alterou os dados. Esta operação foi bloqueada. Recarregue a página para continuar.";
            for (const obs of this.observadores)
                obs.atualizar("CONFLITO_PERSISTENCIA");
            throw new Error(this.avisoPersistencia);
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
        this.verificarConcorrencia();
        const func = this.buscarFuncionarioPorId(idFuncionario);
        if (!func.autenticar(senha)) {
            throw new Error("Senha incorreta para o funcionário selecionado.");
        }
        this.funcionarioLogado = func;
        this.notificar("FUNCIONARIO_AUTENTICADO", func);
        return func;
    }
    definirFuncionarioAtivo(idFuncionario) {
        this.verificarConcorrencia();
        const func = this.buscarFuncionarioPorId(idFuncionario);
        this.funcionarioLogado = func;
        this.notificar("FUNCIONARIO_ALTERADO", func);
        return func;
    }
    getFuncionarioLogado() {
        return this.funcionarioLogado;
    }
    listarAutorizacoesCaixa() {
        return this.listarAutorizacoes().filter(r => r.modulo === ModuloSistema.CAIXA);
    }
    listarAutorizacoes() { return this.autorizacoesCaixa.map(r => ({ ...r })); }
    verificarAcessoModulo(modulo) {
        Cargo.validarModulo(modulo);
        if (this.inicializandoDemo || this.funcionarios.length === 0)
            return;
        if (!this.funcionarioLogado?.temAcessoModulo(modulo))
            throw new Error(`Funcionário sem autorização para ${modulo}. Solicite a um gerente a liberação deste módulo em Equipe.`);
    }
    alterarAutorizacaoCaixa(idFuncionario, permitir, motivo) {
        this.alterarAutorizacao(idFuncionario, ModuloSistema.CAIXA, permitir, motivo);
    }
    alterarAutorizacao(idFuncionario, modulo, permitir, motivo) {
        this.verificarConcorrencia();
        Cargo.validarModulo(modulo);
        const gerente = this.funcionarioLogado;
        if (!gerente?.ehGerente())
            throw new Error("Somente um gerente pode conceder ou revogar autorizações.");
        const alvo = this.buscarFuncionarioPorId(idFuncionario);
        if (typeof motivo !== "string" || motivo.trim().length < 5 || motivo.trim().length > 500)
            throw new Error("Informe um motivo entre 5 e 500 caracteres para a autorização.");
        const justificativa = motivo.trim();
        const registro = Object.freeze({
            id: this.gerarProximoId(this.autorizacoesCaixa.map(r => r.id)), dataHora: new Date().toISOString(), modulo,
            idFuncionario, nomeFuncionario: alvo.getNomeFuncionario(), idGerente: gerente.getIdFuncionario(),
            nomeGerente: gerente.getNomeFuncionario(), antes: alvo.temAutorizacaoModulo(modulo), depois: permitir, motivo: justificativa
        });
        alvo.alterarAutorizacaoModulo(modulo, permitir, gerente);
        this.autorizacoesCaixa.unshift(registro);
        this.notificar("AUTORIZACAO_CAIXA_ALTERADA", { ...registro });
    }
    verificarAcessoCaixa(idSessao, fechamento = false) {
        const ativo = this.funcionarioLogado;
        if (!ativo)
            throw new Error("Selecione um funcionário no topo.");
        if (ativo.ehGerente())
            return ativo;
        if (!ativo.podeOperarCaixa())
            throw new Error("Funcionário sem autorização para operar o caixa. Solicite a autorização de um gerente em Equipe.");
        if (idSessao !== undefined && this.buscarSessaoPorId(idSessao).getFuncionario().getIdFuncionario() !== ativo.getIdFuncionario()) {
            throw new Error("Esta sessão pertence a outro funcionário. Selecione o responsável ou encerre a sessão antes de abrir a sua.");
        }
        return ativo;
    }
    // ==================== CATEGORIAS ====================
    cadastrarCategoria(nomeCategoria) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.ESTOQUE);
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
    cadastrarCargo(nomeCargo, salarioBase, permissoes = []) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.EQUIPE);
        const novoId = this.gerarProximoId(this.cargos.map((c) => c.getIdCargo()));
        const novo = new Cargo(novoId, nomeCargo, salarioBase, permissoes);
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.EQUIPE);
        const documento = Documento.validarCPF(cpf);
        if (this.funcionarios.some(f => Documento.normalizar(f.getCpfFuncionario()) === documento)) {
            throw new Error("Já existe um funcionário com este CPF.");
        }
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.COMPRAS);
        const documento = Documento.validarCNPJ(cnpj);
        if (this.fornecedores.some(f => Documento.normalizar(f.getCnpj()) === documento)) {
            throw new Error("Já existe um fornecedor com este CNPJ.");
        }
        const novoId = this.gerarProximoId(this.fornecedores.map((f) => f.getIdFornecedor()));
        const forn = new Fornecedor(novoId, cnpj, razaoSocial, email, telefones);
        this.fornecedores.push(forn);
        this.notificar("FORNECEDOR_CADASTRADO", forn);
        return forn;
    }
    listarFornecedores(incluirRemovidos = false) {
        return this.fornecedores.filter(f => incluirRemovidos || f.estaAtivo());
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.ESTOQUE);
        const existente = this.produtos.find((p) => p.getCodigoBarras() === codigoBarras.trim());
        if (existente) {
            throw new Error(`Já existe um produto com o código de barras "${codigoBarras}".`);
        }
        const categoria = this.buscarCategoriaPorId(idCategoria);
        const fornecedores = idsFornecedores.map((id) => this.buscarFornecedorPorId(id));
        if (fornecedores.some(f => !f.estaAtivo()))
            throw new Error("Fornecedor removido não pode ser vinculado a novos produtos.");
        const responsavel = idFuncionarioResponsavel !== undefined
            ? this.buscarFuncionarioPorId(idFuncionarioResponsavel)
            : this.funcionarioLogado || this.funcionarios[0];
        if (qtdEstoqueInicial > 0 && !responsavel) {
            throw new Error("Selecione um funcionário responsável pelo estoque inicial.");
        }
        const produto = new Produto(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoqueInicial, estoqueMinimo, categoria, dataValidade, fornecedores);
        this.produtos.push(produto);
        if (qtdEstoqueInicial > 0 && responsavel) {
            this.registrarMovimentacaoInterna(TipoMovimentacao.ENTRADA, qtdEstoqueInicial, produto, responsavel);
        }
        this.notificar("PRODUTO_CADASTRADO", produto);
        return produto;
    }
    listarProdutos(incluirRemovidos = false) {
        return this.produtos.filter(p => incluirRemovidos || p.estaAtivo());
    }
    listarRemocoes() { return this.remocoes.map(r => ({ ...r })); }
    prepararRemocao(tipo, referencia, descricao) {
        const responsavel = this.funcionarioLogado;
        if (!responsavel)
            throw new Error("Selecione o funcionário responsável.");
        return Object.freeze({ tipo, referencia, descricao, idFuncionario: responsavel.getIdFuncionario(), nomeFuncionario: responsavel.getNomeFuncionario(), dataHora: new Date().toISOString() });
    }
    removerProduto(codigo) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.ESTOQUE);
        const produto = this.buscarProdutoPorCodigo(codigo);
        const registro = this.prepararRemocao("PRODUTO", codigo, produto.getDescricaoProduto());
        produto.inativar();
        this.remocoes.unshift(registro);
        this.notificar("PRODUTO_REMOVIDO");
    }
    removerFornecedor(id) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.COMPRAS);
        const fornecedor = this.buscarFornecedorPorId(id);
        const registro = this.prepararRemocao("FORNECEDOR", String(id), fornecedor.getRazaoSocial());
        fornecedor.inativar();
        this.remocoes.unshift(registro);
        this.notificar("FORNECEDOR_REMOVIDO");
    }
    buscarProdutoPorCodigo(codigoBarras) {
        const prod = this.produtos.find((p) => p.getCodigoBarras() === codigoBarras.trim());
        if (!prod) {
            throw new Error(`Produto com código de barras "${codigoBarras}" não encontrado.`);
        }
        return prod;
    }
    listarProdutosAbaixoDoMinimo() {
        return this.produtos.filter((p) => p.estaAtivo() && p.abaixoDoEstoqueMinimo());
    }
    listarProdutosVencidos() {
        return this.produtos.filter((p) => p.estaAtivo() && p.getQtdEstoque() > 0 && p.estaVencido());
    }
    listarCorrecoesValidade() {
        return this.correcoesValidade.map(c => c.getRegistro());
    }
    corrigirValidadeProduto(codigo, novaData, motivo, idFuncionario) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.ESTOQUE);
        const produto = this.buscarProdutoPorCodigo(codigo);
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const correcao = new CorrecaoValidade({
            id: this.gerarProximoId(this.listarCorrecoesValidade().map(c => c.id)),
            dataHora: new Date().toISOString(), codigoBarras: produto.getCodigoBarras(),
            descricaoProduto: produto.getDescricaoProduto(), validadeAnterior: produto.getDataValidade(),
            novaValidade: novaData, motivo, idFuncionario: funcionario.getIdFuncionario(),
            nomeFuncionario: funcionario.getNomeFuncionario()
        });
        produto.corrigirDataValidade(novaData, motivo);
        this.correcoesValidade.unshift(correcao);
        this.notificar("VALIDADE_CORRIGIDA", correcao.getRegistro());
        return correcao.getRegistro();
    }
    realizarAjusteEstoque(codigoBarras, tipo, quantidade, idFuncionario) {
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.ESTOQUE);
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.COMPRAS);
        if (!itensInput || itensInput.length === 0) {
            throw new Error("A compra precisa ter ao menos um produto.");
        }
        const fornecedor = this.buscarFornecedorPorId(idFornecedor);
        if (!fornecedor.estaAtivo())
            throw new Error("Fornecedor removido não permite novas compras.");
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const novoId = this.gerarProximoId(this.compras.map((c) => c.getIdCompra()));
        const compra = new Compra(novoId, dataCompra, fornecedor, funcionario);
        for (const item of itensInput) {
            const produto = this.buscarProdutoPorCodigo(item.codigoBarras);
            produto.exigirAtivo();
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.CAIXA);
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
        this.verificarConcorrencia();
        const caixa = this.buscarCaixaPorId(idCaixa);
        if (caixa.getStatusCaixa() !== StatusCaixa.LIVRE) {
            throw new Error(`O Caixa #${caixa.getNumeroCaixa()} não está livre (${caixa.getStatusCaixa()}).`);
        }
        const funcionario = this.buscarFuncionarioPorId(idFuncionario);
        const ativo = this.verificarAcessoCaixa();
        if (ativo.getIdFuncionario() !== funcionario.getIdFuncionario())
            throw new Error("A sessão deve ser aberta pelo funcionário ativo.");
        const novoId = this.gerarProximoId(this.sessoesCaixa.map((s) => s.getIdSessao()));
        const sessao = new SessaoCaixa(novoId, this.formatarDataHoraAtual(), valorInicial, funcionario, caixa);
        this.sessoesCaixa.unshift(sessao);
        this.sessoesSelecionadas[String(idFuncionario)] = sessao.getIdSessao();
        this.notificar("SESSAO_ABERTA", sessao);
        return sessao;
    }
    fecharSessaoCaixa(idSessao, valorFinalConferido) {
        this.verificarConcorrencia();
        const sessao = this.buscarSessaoPorId(idSessao);
        const responsavel = this.verificarAcessoCaixa(idSessao, true);
        sessao.fecharSessao(this.formatarDataHoraAtual(), valorFinalConferido, responsavel.getIdFuncionario());
        for (const id of Object.keys(this.sessoesSelecionadas))
            if (this.sessoesSelecionadas[id] === idSessao)
                delete this.sessoesSelecionadas[id];
        this.notificar("SESSAO_FECHADA", sessao);
        return sessao;
    }
    obterSessaoAbertaAtual() {
        return this.sessoesCaixa.find((s) => s.estaAberta());
    }
    listarSessoesAcessiveis() {
        const ativo = this.funcionarioLogado;
        if (!ativo?.podeOperarCaixa())
            return [];
        return this.sessoesCaixa.filter(s => s.estaAberta() && (ativo.ehGerente() || s.getFuncionario().getIdFuncionario() === ativo.getIdFuncionario()));
    }
    obterSessaoSelecionada() {
        const id = this.funcionarioLogado?.getIdFuncionario();
        if (id === undefined)
            return undefined;
        return this.listarSessoesAcessiveis().find(s => s.getIdSessao() === this.sessoesSelecionadas[String(id)]);
    }
    selecionarSessaoCaixa(idSessao) {
        this.verificarConcorrencia();
        const sessao = this.buscarSessaoPorId(idSessao);
        const ativo = this.verificarAcessoCaixa(idSessao);
        if (!sessao.estaAberta())
            throw new Error("Selecione uma sessão aberta.");
        this.sessoesSelecionadas[String(ativo.getIdFuncionario())] = idSessao;
        this.notificar("SESSAO_SELECIONADA");
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
        this.verificarConcorrencia();
        this.verificarAcessoModulo(ModuloSistema.CAIXA);
        const documento = Documento.validarCPF(cpf);
        if (this.clientes.some(c => Documento.normalizar(c.getCpfCliente()) === documento)) {
            throw new Error("Já existe um cliente com este CPF.");
        }
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
        this.verificarConcorrencia();
        const sessao = this.buscarSessaoPorId(idSessao);
        const operador = this.verificarAcessoCaixa(idSessao);
        if (!sessao.estaAberta()) {
            throw new Error("A sessão de caixa informada está fechada. Abra uma sessão antes de vender.");
        }
        const cliente = idCliente ? this.buscarClientePorId(idCliente) : undefined;
        const novoId = this.gerarProximoId(this.vendas.map((v) => v.getIdVenda()));
        const venda = new Venda(novoId, this.formatarDataHoraAtual(), sessao, cliente, operador);
        for (const item of itensInput) {
            const produto = this.buscarProdutoPorCodigo(item.codigoBarras);
            venda.adicionarItem(produto, item.qtdVenda);
        }
        for (const pag of pagamentosInput) {
            const forma = this.buscarFormaPagamentoPorId(pag.idForma);
            venda.adicionarPagamento(forma, pag.valorPago);
        }
        venda.validarVendaParaFinalizacao();
        // Rastrear quem realizou a venda, separadamente de quem abriu a sessão.
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
    resetarDadosParaPadrao(substituirEstadoCorrompido = true) {
        this.verificarConcorrencia();
        if (this.estadoCorrompido && substituirEstadoCorrompido) {
            // A ação explícita da interface confirma a substituição; preserve o original antes.
            const original = globalThis.localStorage.getItem(this.chaveStorage);
            if (original !== null) {
                globalThis.localStorage.setItem(this.chaveStorage + "_recuperacao_" + Date.now(), original);
            }
            this.ultimoEstadoPersistido = original;
            this.estadoCorrompido = false;
        }
        this.categorias = [];
        this.cargos = [];
        this.funcionarios = [];
        this.fornecedores = [];
        this.produtos = [];
        this.compras = [];
        this.movimentacoes = [];
        this.correcoesValidade = [];
        this.autorizacoesCaixa = [];
        this.remocoes = [];
        this.sessoesSelecionadas = {};
        this.caixas = [];
        this.sessoesCaixa = [];
        this.clientes = [];
        this.formasPagamento = [];
        this.vendas = [];
        this.funcionarioLogado = null;
        this.inicializandoDemo = true;
        try {
            this.popularDadosIniciais();
        }
        finally {
            this.inicializandoDemo = false;
        }
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
        const cargoGerente = new Cargo(1, "Gerente Geral", 4200.0, [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS, ModuloSistema.EQUIPE]);
        const cargoCaixa = new Cargo(2, "Operador de Caixa", 2150.0, [ModuloSistema.CAIXA]);
        const cargoEstoquista = new Cargo(3, "Auxiliar de Estoque", 2250.0, [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS]);
        this.cargos.push(cargoGerente, cargoCaixa, cargoEstoquista);
        // A demonstração usa identificadores não numéricos e nenhum contato real.
        // Os identificadores de exemplo não passam pelas validações de cadastros novos.
        const senhaDemo = () => globalThis.crypto?.randomUUID?.() ?? "";
        const funcGerente = new Funcionario(1, "DEMO-FUNC-01", "Gerente Demo", senhaDemo(), "2025-02-10", cargoGerente, [], "historico");
        const funcCaixa = new Funcionario(2, "DEMO-FUNC-02", "Operadora Demo", senhaDemo(), "2025-03-15", cargoCaixa, [], "historico");
        const funcEstoquista = new Funcionario(3, "DEMO-FUNC-03", "Estoquista Demo", senhaDemo(), "2025-04-01", cargoEstoquista, [], "historico");
        this.funcionarios.push(funcGerente, funcCaixa, funcEstoquista);
        this.funcionarioLogado = funcCaixa;
        const fornAlimentos = new Fornecedor(1, "DEMO-FORN-01", "Distribuidora Demo", "vendas@example.invalid", [], "historico");
        const fornLaticinios = new Fornecedor(2, "DEMO-FORN-02", "Laticínios Demo", "contato@example.invalid", [], "historico");
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
        const cli1 = new Cliente(1, "Cliente Demo 1", "", "DEMO-CLI-01", "historico");
        const cli2 = new Cliente(2, "Cliente Demo 2", "", "DEMO-CLI-02", "historico");
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
        if (this.estadoCorrompido || this.conflitoPersistencia)
            return;
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
            this.avisoPersistencia = "Armazenamento indisponível. Alterações apenas na memória desta aba.";
            return;
        }
        try {
            this.verificarConcorrencia();
            const payload = {
                funcionarioAtivoId: this.funcionarioLogado?.getIdFuncionario(),
                sessoesSelecionadas: { ...this.sessoesSelecionadas },
                remocoes: this.listarRemocoes(),
                categorias: this.categorias.map((c) => ({
                    idCategoria: c.getIdCategoria(),
                    nomeCategoria: c.getNomeCategoria()
                })),
                cargos: this.cargos.map((c) => ({
                    idCargo: c.getIdCargo(),
                    nomeCargo: c.getNomeCargo(),
                    salarioBase: c.getSalarioBase(), permissoes: c.getPermissoes()
                })),
                funcionarios: this.funcionarios.map((f) => ({
                    idFuncionario: f.getIdFuncionario(),
                    cpfFuncionario: f.getCpfFuncionario(),
                    nomeFuncionario: f.getNomeFuncionario(),
                    senha: f.getSenha(),
                    dataAdmissao: f.getDataAdmissao(),
                    idCargo: f.getCargo().getIdCargo(),
                    autorizadoNoCaixa: f.temAutorizacaoCaixa(),
                    autorizacoesIndividuais: f.getAutorizacoesIndividuais(),
                    telefones: f.getTelefones()
                })),
                fornecedores: this.fornecedores.map((f) => ({
                    idFornecedor: f.getIdFornecedor(),
                    cnpj: f.getCnpj(),
                    razaoSocial: f.getRazaoSocial(),
                    ativo: f.estaAtivo(),
                    email: f.getEmail(),
                    telefones: f.getTelefones()
                })),
                produtos: this.produtos.map((p) => ({
                    codigoBarras: p.getCodigoBarras(),
                    ativo: p.estaAtivo(),
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
                correcoesValidade: this.listarCorrecoesValidade(),
                autorizacoesCaixa: this.listarAutorizacoes(),
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
                    esperadoNoFechamento: s.getEsperadoNoFechamento(),
                    valorConferido: s.getValorConferido(),
                    idResponsavelFechamento: s.getIdResponsavelFechamento(),
                    idFuncionario: s.getFuncionario().getIdFuncionario(),
                    idCaixa: s.getCaixa().getIdCaixa()
                })),
                vendas: this.vendas.map((v) => ({
                    idVenda: v.getIdVenda(),
                    dataHoraVenda: v.getDataHoraVenda(),
                    idSessao: v.getSessaoCaixa().getIdSessao(),
                    idOperadorVenda: v.getIdOperadorRegistrado(),
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
            const serializado = JSON.stringify(payload);
            globalThis.localStorage.setItem(this.chaveStorage, serializado);
            this.ultimoEstadoPersistido = serializado;
            this.avisoPersistencia = null;
        }
        catch {
            if (!this.conflitoPersistencia)
                this.avisoPersistencia = "Não foi possível salvar. Alterações estão apenas na memória desta aba e podem ser perdidas ao fechar ou recarregar. O último estado salvo foi preservado.";
        }
    }
    carregarEstado() {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
            return false;
        }
        try {
            const bruto = globalThis.localStorage.getItem(this.chaveStorage);
            this.ultimoEstadoPersistido = bruto;
            if (bruto === null)
                return false;
            const dados = JSON.parse(bruto);
            this.categorias = dados.categorias.map((c) => new Categoria(c.idCategoria, c.nomeCategoria));
            this.cargos = dados.cargos.map((c) => new Cargo(c.idCargo, c.nomeCargo, c.salarioBase, Object.prototype.hasOwnProperty.call(c, "permissoes") ? c.permissoes : Cargo.permissoesLegadas(c.nomeCargo)));
            this.funcionarios = dados.funcionarios.map((f) => new Funcionario(f.idFuncionario, f.cpfFuncionario, f.nomeFuncionario, f.senha, f.dataAdmissao, this.buscarCargoPorId(f.idCargo), f.telefones, "historico", f.autorizadoNoCaixa ?? false, Object.prototype.hasOwnProperty.call(f, "autorizacoesIndividuais") ? f.autorizacoesIndividuais : undefined));
            this.funcionarioLogado = this.funcionarios.find(f => f.getIdFuncionario() === dados.funcionarioAtivoId) || this.funcionarios[0] || null;
            this.fornecedores = dados.fornecedores.map((f) => new Fornecedor(f.idFornecedor, f.cnpj, f.razaoSocial, f.email, f.telefones, "historico", f.ativo ?? true));
            this.produtos = dados.produtos.map((p) => new Produto(p.codigoBarras, p.descricaoProduto, p.precoVenda, p.custoProduto, p.unidadeMedida, p.qtdEstoque, p.estoqueMinimo, this.buscarCategoriaPorId(p.idCategoria), p.dataValidade, (p.idsFornecedores || []).map((id) => this.buscarFornecedorPorId(id)), p.ativo ?? true));
            this.caixas = dados.caixas.map((c) => new Caixa(c.idCaixa, c.numeroCaixa, c.statusCaixa));
            this.clientes = dados.clientes.map((c) => new Cliente(c.idCliente, c.nomeCliente, c.telefoneCliente, c.cpfCliente, "historico"));
            this.formasPagamento = dados.formasPagamento.map((f) => new FormaPagamento(f.idForma, f.descricao));
            this.compras = dados.compras.map((c) => {
                const compra = new Compra(c.idCompra, c.dataCompra, this.buscarFornecedorPorId(c.idFornecedor), this.buscarFuncionarioPorId(c.idFuncionario));
                for (const item of c.itens) {
                    compra.adicionarItem(this.buscarProdutoPorCodigo(item.codigoBarras), item.qtdCompra, item.custoUnitario);
                }
                return compra;
            });
            this.correcoesValidade = (dados.correcoesValidade ?? []).map((c) => new CorrecaoValidade(c));
            this.autorizacoesCaixa = (dados.autorizacoesCaixa ?? []).map((r) => Object.freeze({
                id: r.id, dataHora: r.dataHora, idFuncionario: r.idFuncionario, nomeFuncionario: r.nomeFuncionario,
                modulo: Cargo.validarModulo(Object.prototype.hasOwnProperty.call(r, "modulo") ? r.modulo : ModuloSistema.CAIXA),
                idGerente: r.idGerente, nomeGerente: r.nomeGerente, antes: r.antes, depois: r.depois, motivo: r.motivo
            }));
            this.movimentacoes = dados.movimentacoes.map((m) => new MovimentacaoEstoque(m.idMovimentacao, m.dataHoraMov, m.tipo, m.qtdMovimentacao, this.buscarProdutoPorCodigo(m.codigoBarras), this.buscarFuncionarioPorId(m.idFuncionario)));
            this.sessoesCaixa = dados.sessoesCaixa.map((s) => {
                const sessao = new SessaoCaixa(s.idSessao, s.dataAbertura, s.valorInicial, this.buscarFuncionarioPorId(s.idFuncionario), this.buscarCaixaPorId(s.idCaixa), "historico");
                sessao.restaurarFechamento(s.dataFechamento, s.valorFinal, s.esperadoNoFechamento, s.valorConferido, s.idResponsavelFechamento);
                return sessao;
            });
            this.vendas = dados.vendas.map((v) => {
                const sessao = this.buscarSessaoPorId(v.idSessao);
                const cli = v.idCliente ? this.buscarClientePorId(v.idCliente) : undefined;
                const venda = new Venda(v.idVenda, v.dataHoraVenda, sessao, cli, v.idOperadorVenda === undefined ? undefined : this.buscarFuncionarioPorId(v.idOperadorVenda));
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
            this.remocoes = (dados.remocoes ?? []).map((r) => Object.freeze({ tipo: r.tipo, referencia: r.referencia, descricao: r.descricao, idFuncionario: r.idFuncionario, nomeFuncionario: r.nomeFuncionario, dataHora: r.dataHora }));
            this.sessoesSelecionadas = {};
            if (dados.sessoesSelecionadas !== undefined) {
                if (!dados.sessoesSelecionadas || Array.isArray(dados.sessoesSelecionadas) || typeof dados.sessoesSelecionadas !== "object")
                    throw new Error("Seleção de sessões inválida.");
                for (const [funcionario, idSessao] of Object.entries(dados.sessoesSelecionadas)) {
                    this.buscarFuncionarioPorId(Number(funcionario));
                    const sessao = this.buscarSessaoPorId(Number(idSessao));
                    if (sessao.estaAberta())
                        this.sessoesSelecionadas[funcionario] = sessao.getIdSessao();
                }
            }
            else {
                // Legado: adotar somente uma sessão inequívoca do próprio responsável.
                for (const f of this.funcionarios) {
                    const proprias = this.sessoesCaixa.filter(s => s.estaAberta() && s.getFuncionario() === f);
                    if (proprias.length === 1)
                        this.sessoesSelecionadas[String(f.getIdFuncionario())] = proprias[0].getIdSessao();
                }
            }
            for (const caixa of this.caixas) {
                const ocupada = this.sessoesCaixa.some(s => s.estaAberta() && s.getCaixa() === caixa);
                if (ocupada)
                    caixa.setStatusCaixa(StatusCaixa.OCUPADO);
            }
            return true;
        }
        catch {
            this.estadoCorrompido = true;
            this.avisoPersistencia = "Não foi possível carregar os dados salvos. O original foi preservado e não será sobrescrito automaticamente. A demonstração está apenas na memória. Recarregue após recuperar os dados ou use Restaurar Dados Demo para substituir com cópia de recuperação.";
            return false;
        }
    }
}
