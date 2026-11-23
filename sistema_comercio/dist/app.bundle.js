// Bundle gerado automaticamente a partir do código TypeScript (POO)
(() => {

// --- Entidades.js ---
var StatusCaixa;
(function (StatusCaixa) {
    StatusCaixa["LIVRE"] = "LIVRE";
    StatusCaixa["OCUPADO"] = "OCUPADO";
    StatusCaixa["MANUTENCAO"] = "MANUTENCAO";
})(StatusCaixa || (StatusCaixa = {}));
var TipoMovimentacao;
(function (TipoMovimentacao) {
    TipoMovimentacao["ENTRADA"] = "ENTRADA";
    TipoMovimentacao["SAIDA"] = "SAIDA";
    TipoMovimentacao["AJUSTE"] = "AJUSTE";
})(TipoMovimentacao || (TipoMovimentacao = {}));
class Categoria {
    constructor(idCategoria, nomeCategoria) {
        if (!nomeCategoria || nomeCategoria.trim() === "") {
            throw new Error("O nome da categoria não pode ser vazio.");
        }
        this.idCategoria = idCategoria;
        this.nomeCategoria = nomeCategoria.trim();
    }
    getId() {
        return this.idCategoria;
    }
    getIdCategoria() {
        return this.idCategoria;
    }
    getNomeCategoria() {
        return this.nomeCategoria;
    }
    setNomeCategoria(novoNome) {
        if (!novoNome || novoNome.trim() === "") {
            throw new Error("O nome da categoria não pode ser vazio.");
        }
        this.nomeCategoria = novoNome.trim();
    }
}
class Cargo {
    constructor(idCargo, nomeCargo, salarioBase) {
        if (!nomeCargo || nomeCargo.trim() === "") {
            throw new Error("O nome do cargo é obrigatório.");
        }
        if ((!Number.isFinite(salarioBase) || salarioBase < 0)) {
            throw new Error("O salário base não pode ser negativo.");
        }
        this.idCargo = idCargo;
        this.nomeCargo = nomeCargo.trim();
        this.salarioBase = salarioBase;
    }
    getId() {
        return this.idCargo;
    }
    getIdCargo() {
        return this.idCargo;
    }
    getNomeCargo() {
        return this.nomeCargo;
    }
    setNomeCargo(nome) {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do cargo não pode ser vazio.");
        }
        this.nomeCargo = nome.trim();
    }
    getSalarioBase() {
        return this.salarioBase;
    }
    setSalarioBase(salario) {
        if ((!Number.isFinite(salario) || salario < 0)) {
            throw new Error("O salário base não pode ser negativo.");
        }
        this.salarioBase = salario;
    }
}
class Funcionario {
    constructor(idFuncionario, cpfFuncionario, nomeFuncionario, senha, dataAdmissao, cargo, telefones = []) {
        this.telefones = [];
        if (!nomeFuncionario || nomeFuncionario.trim() === "") {
            throw new Error("O nome do funcionário é obrigatório.");
        }
        if (!cpfFuncionario || cpfFuncionario.trim() === "") {
            throw new Error("O CPF do funcionário é obrigatório.");
        }
        this.idFuncionario = idFuncionario;
        this.cpfFuncionario = cpfFuncionario.trim();
        this.nomeFuncionario = nomeFuncionario.trim();
        this.senha = senha;
        this.dataAdmissao = dataAdmissao;
        this.cargo = cargo;
        telefones.forEach((t) => this.adicionarTelefone(t));
    }
    getId() {
        return this.idFuncionario;
    }
    getIdFuncionario() {
        return this.idFuncionario;
    }
    getCpfFuncionario() {
        return this.cpfFuncionario;
    }
    getNomeFuncionario() {
        return this.nomeFuncionario;
    }
    getDataAdmissao() {
        return this.dataAdmissao;
    }
    getCargo() {
        return this.cargo;
    }
    setCargo(novoCargo) {
        this.cargo = novoCargo;
    }
    getTelefones() {
        return [...this.telefones];
    }
    adicionarTelefone(telefone) {
        const limpo = telefone.trim();
        if (limpo && !this.telefones.includes(limpo)) {
            this.telefones.push(limpo);
        }
    }
    removerTelefone(telefone) {
        this.telefones = this.telefones.filter((t) => t !== telefone);
    }
    autenticar(senhaInformada) {
        return this.senha === senhaInformada;
    }
    getSenha() {
        return this.senha;
    }
}
class Fornecedor {
    constructor(idFornecedor, cnpj, razaoSocial, email, telefones = []) {
        this.telefones = [];
        if (!razaoSocial || razaoSocial.trim() === "") {
            throw new Error("A razão social do fornecedor é obrigatória.");
        }
        if (!cnpj || cnpj.trim() === "") {
            throw new Error("O CNPJ do fornecedor é obrigatório.");
        }
        this.idFornecedor = idFornecedor;
        this.cnpj = cnpj.trim();
        this.razaoSocial = razaoSocial.trim();
        this.email = email.trim();
        telefones.forEach((t) => this.adicionarTelefone(t));
    }
    getId() {
        return this.idFornecedor;
    }
    getIdFornecedor() {
        return this.idFornecedor;
    }
    getCnpj() {
        return this.cnpj;
    }
    getRazaoSocial() {
        return this.razaoSocial;
    }
    getEmail() {
        return this.email;
    }
    getTelefones() {
        return [...this.telefones];
    }
    adicionarTelefone(telefone) {
        const limpo = telefone.trim();
        if (limpo && !this.telefones.includes(limpo)) {
            this.telefones.push(limpo);
        }
    }
}
class Cliente {
    constructor(idCliente, nomeCliente, telefoneCliente, cpfCliente) {
        if (!nomeCliente || nomeCliente.trim() === "") {
            throw new Error("O nome do cliente é obrigatório.");
        }
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente.trim();
        this.telefoneCliente = telefoneCliente.trim();
        this.cpfCliente = cpfCliente.trim();
    }
    getId() {
        return this.idCliente;
    }
    getIdCliente() {
        return this.idCliente;
    }
    getNomeCliente() {
        return this.nomeCliente;
    }
    getTelefoneCliente() {
        return this.telefoneCliente;
    }
    getCpfCliente() {
        return this.cpfCliente;
    }
}
class FormaPagamento {
    constructor(idForma, descricao) {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A descrição da forma de pagamento é obrigatória.");
        }
        this.idForma = idForma;
        this.descricao = descricao.trim();
    }
    getId() {
        return this.idForma;
    }
    getIdForma() {
        return this.idForma;
    }
    getDescricao() {
        return this.descricao;
    }
}
class Caixa {
    constructor(idCaixa, numeroCaixa, statusCaixa = StatusCaixa.LIVRE) {
        if ((!Number.isFinite(numeroCaixa) || numeroCaixa <= 0)) {
            throw new Error("O número do caixa deve ser maior que zero.");
        }
        this.idCaixa = idCaixa;
        this.numeroCaixa = numeroCaixa;
        this.statusCaixa = statusCaixa;
    }
    getId() {
        return this.idCaixa;
    }
    getIdCaixa() {
        return this.idCaixa;
    }
    getNumeroCaixa() {
        return this.numeroCaixa;
    }
    getStatusCaixa() {
        return this.statusCaixa;
    }
    setStatusCaixa(novoStatus) {
        this.statusCaixa = novoStatus;
    }
}


// --- EstoqueECompras.js ---

class Produto {
    constructor(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoque, estoqueMinimo, categoria, dataValidade, fornecedores = []) {
        this.fornecedores = [];
        if (!codigoBarras || codigoBarras.trim() === "") {
            throw new Error("O código de barras do produto é obrigatório.");
        }
        if (!descricaoProduto || descricaoProduto.trim() === "") {
            throw new Error("A descrição do produto é obrigatória.");
        }
        if ((!Number.isFinite(precoVenda) || precoVenda < 0) || (!Number.isFinite(custoProduto) || custoProduto < 0)) {
            throw new Error("Preço de venda e custo não podem ser negativos.");
        }
        if ((!Number.isFinite(qtdEstoque) || qtdEstoque < 0) || (!Number.isFinite(estoqueMinimo) || estoqueMinimo < 0)) {
            throw new Error("Quantidade de estoque e estoque mínimo não podem ser negativos.");
        }
        this.codigoBarras = codigoBarras.trim();
        this.descricaoProduto = descricaoProduto.trim();
        this.precoVenda = precoVenda;
        this.custoProduto = custoProduto;
        this.unidadeMedida = unidadeMedida.trim() || "UN";
        this.qtdEstoque = qtdEstoque;
        this.estoqueMinimo = estoqueMinimo;
        this.categoria = categoria;
        this.dataValidade = dataValidade && dataValidade.trim() !== "" ? dataValidade.trim() : undefined;
        fornecedores.forEach((f) => this.vincularFornecedor(f));
    }
    getId() {
        return this.codigoBarras;
    }
    getCodigoBarras() {
        return this.codigoBarras;
    }
    getDescricaoProduto() {
        return this.descricaoProduto;
    }
    setDescricaoProduto(descricao) {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A descrição do produto não pode ser vazia.");
        }
        this.descricaoProduto = descricao.trim();
    }
    getPrecoVenda() {
        return this.precoVenda;
    }
    setPrecoVenda(novoPreco) {
        if ((!Number.isFinite(novoPreco) || novoPreco < 0)) {
            throw new Error("O preço de venda não pode ser negativo.");
        }
        this.precoVenda = novoPreco;
    }
    getCustoProduto() {
        return this.custoProduto;
    }
    setCustoProduto(novoCusto) {
        if ((!Number.isFinite(novoCusto) || novoCusto < 0)) {
            throw new Error("O custo do produto não pode ser negativo.");
        }
        this.custoProduto = novoCusto;
    }
    getUnidadeMedida() {
        return this.unidadeMedida;
    }
    getQtdEstoque() {
        return this.qtdEstoque;
    }
    getEstoqueMinimo() {
        return this.estoqueMinimo;
    }
    setEstoqueMinimo(minimo) {
        if ((!Number.isFinite(minimo) || minimo < 0)) {
            throw new Error("O estoque mínimo não pode ser negativo.");
        }
        this.estoqueMinimo = minimo;
    }
    getDataValidade() {
        return this.dataValidade;
    }
    getCategoria() {
        return this.categoria;
    }
    getFornecedores() {
        return [...this.fornecedores];
    }
    vincularFornecedor(fornecedor) {
        const jaExiste = this.fornecedores.some((f) => f.getIdFornecedor() === fornecedor.getIdFornecedor());
        if (!jaExiste) {
            this.fornecedores.push(fornecedor);
        }
    }
    abaixoDoEstoqueMinimo() {
        return this.qtdEstoque <= this.estoqueMinimo;
    }
    estaVencido(dataReferencia = new Date()) {
        if (!this.dataValidade) {
            return false;
        }
        const validade = new Date(this.dataValidade + "T23:59:59");
        return validade.getTime() < dataReferencia.getTime();
    }
    adicionarEstoque(quantidade) {
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de entrada no estoque deve ser maior que zero.");
        }
        this.qtdEstoque = Number((this.qtdEstoque + quantidade).toFixed(3));
    }
    removerEstoque(quantidade) {
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de saída do estoque deve ser maior que zero.");
        }
        if (quantidade > this.qtdEstoque) {
            throw new Error(`Estoque insuficiente para o produto "${this.descricaoProduto}". Disponível: ${this.qtdEstoque} ${this.unidadeMedida}.`);
        }
        this.qtdEstoque = Number((this.qtdEstoque - quantidade).toFixed(3));
    }
    definirEstoquePorAjuste(novaQuantidade) {
        if ((!Number.isFinite(novaQuantidade) || novaQuantidade < 0)) {
            throw new Error("A quantidade em estoque após ajuste não pode ser negativa.");
        }
        this.qtdEstoque = Number(novaQuantidade.toFixed(3));
    }
}
class MovimentacaoEstoque {
    constructor(idMovimentacao, dataHoraMov, tipo, qtdMovimentacao, produto, funcionarioResponsavel) {
        if (!Number.isFinite(qtdMovimentacao) || qtdMovimentacao < 0 || (qtdMovimentacao === 0 && tipo !== TipoMovimentacao.AJUSTE)) {
            throw new Error("A quantidade movimentada deve ser maior que zero.");
        }
        this.idMovimentacao = idMovimentacao;
        this.dataHoraMov = dataHoraMov;
        this.tipo = tipo;
        this.qtdMovimentacao = qtdMovimentacao;
        this.produto = produto;
        this.funcionarioResponsavel = funcionarioResponsavel;
    }
    getId() {
        return this.idMovimentacao;
    }
    getIdMovimentacao() {
        return this.idMovimentacao;
    }
    getDataHoraMov() {
        return this.dataHoraMov;
    }
    getTipo() {
        return this.tipo;
    }
    getQtdMovimentacao() {
        return this.qtdMovimentacao;
    }
    getProduto() {
        return this.produto;
    }
    getCodigoBarras() {
        return this.produto.getCodigoBarras();
    }
    getFuncionarioResponsavel() {
        return this.funcionarioResponsavel;
    }
}
class ItemCompra {
    constructor(idCompra, produto, qtdCompra, custoUnitario) {
        if ((!Number.isFinite(qtdCompra) || qtdCompra <= 0)) {
            throw new Error("A quantidade comprada deve ser maior que zero.");
        }
        if ((!Number.isFinite(custoUnitario) || custoUnitario < 0)) {
            throw new Error("O custo unitário não pode ser negativo.");
        }
        this.idCompra = idCompra;
        this.produto = produto;
        this.qtdCompra = qtdCompra;
        this.custoUnitario = custoUnitario;
    }
    getIdCompra() {
        return this.idCompra;
    }
    getProduto() {
        return this.produto;
    }
    getCodigoBarras() {
        return this.produto.getCodigoBarras();
    }
    getQtdCompra() {
        return this.qtdCompra;
    }
    getCustoUnitario() {
        return this.custoUnitario;
    }
    getSubtotal() {
        return Number((this.qtdCompra * this.custoUnitario).toFixed(2));
    }
}
class Compra {
    constructor(idCompra, dataCompra, fornecedor, funcionarioResponsavel) {
        this.valorTotal = 0;
        this.itens = [];
        this.idCompra = idCompra;
        this.dataCompra = dataCompra;
        this.fornecedor = fornecedor;
        this.funcionarioResponsavel = funcionarioResponsavel;
    }
    getId() {
        return this.idCompra;
    }
    getIdCompra() {
        return this.idCompra;
    }
    getDataCompra() {
        return this.dataCompra;
    }
    getValorTotal() {
        return this.valorTotal;
    }
    getFornecedor() {
        return this.fornecedor;
    }
    getFuncionarioResponsavel() {
        return this.funcionarioResponsavel;
    }
    getItens() {
        return [...this.itens];
    }
    adicionarItem(produto, qtdCompra, custoUnitario) {
        const novoItem = new ItemCompra(this.idCompra, produto, qtdCompra, custoUnitario);
        this.itens.push(novoItem);
        this.recalcularValorTotal();
    }
    recalcularValorTotal() {
        const soma = this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
        this.valorTotal = Number(soma.toFixed(2));
    }
}


// --- CaixaEVendas.js ---

class SessaoCaixa {
    constructor(idSessao, dataAbertura, valorInicial, funcionario, caixa) {
        this.vendas = [];
        if ((!Number.isFinite(valorInicial) || valorInicial < 0)) {
            throw new Error("O valor inicial da sessão de caixa não pode ser negativo.");
        }
        this.idSessao = idSessao;
        this.dataAbertura = dataAbertura;
        this.valorInicial = Number(valorInicial.toFixed(2));
        this.funcionario = funcionario;
        this.caixa = caixa;
        this.caixa.setStatusCaixa(StatusCaixa.OCUPADO);
    }
    getId() {
        return this.idSessao;
    }
    getIdSessao() {
        return this.idSessao;
    }
    getDataAbertura() {
        return this.dataAbertura;
    }
    getDataFechamento() {
        return this.dataFechamento;
    }
    getValorInicial() {
        return this.valorInicial;
    }
    getValorFinal() {
        return this.valorFinal;
    }
    getFuncionario() {
        return this.funcionario;
    }
    getCaixa() {
        return this.caixa;
    }
    getVendas() {
        return [...this.vendas];
    }
    estaAberta() {
        return this.dataFechamento === undefined;
    }
    vincularVenda(venda) {
        if (!this.estaAberta()) {
            throw new Error("Não é possível registrar venda em uma sessão de caixa já fechada.");
        }
        this.vendas.push(venda);
    }
    restaurarVenda(venda) {
        this.vendas.push(venda);
    }
    calcularTotalVendas() {
        const total = this.vendas.reduce((acc, v) => acc + v.getValorTotal(), 0);
        return Number(total.toFixed(2));
    }
    calcularSaldoEsperado() {
        return Number((this.valorInicial + this.calcularTotalVendas()).toFixed(2));
    }
    fecharSessao(dataFechamento, valorFinalConferido) {
        if (!this.estaAberta()) {
            throw new Error("Esta sessão de caixa já foi fechada.");
        }
        if (valorFinalConferido !== undefined && (!Number.isFinite(valorFinalConferido) || valorFinalConferido < 0)) {
            throw new Error("O valor conferido deve ser um número finito não negativo.");
        }
        this.dataFechamento = dataFechamento;
        const saldoCalculado = this.calcularSaldoEsperado();
        this.valorFinal = valorFinalConferido !== undefined
            ? Number(valorFinalConferido.toFixed(2))
            : saldoCalculado;
        this.caixa.setStatusCaixa(StatusCaixa.LIVRE);
        return this.valorFinal;
    }
    restaurarFechamento(dataFechamento, valorFinal) {
        this.dataFechamento = dataFechamento;
        this.valorFinal = valorFinal;
        if (dataFechamento) {
            this.caixa.setStatusCaixa(StatusCaixa.LIVRE);
        }
        else {
            this.caixa.setStatusCaixa(StatusCaixa.OCUPADO);
        }
    }
}
class ItemVenda {
    constructor(idVenda, produto, qtdVenda, precoUnitario) {
        if ((!Number.isFinite(qtdVenda) || qtdVenda <= 0)) {
            throw new Error("A quantidade vendida deve ser maior que zero.");
        }
        const preco = precoUnitario !== undefined ? precoUnitario : produto.getPrecoVenda();
        if ((!Number.isFinite(preco) || preco < 0)) {
            throw new Error("O preço unitário não pode ser negativo.");
        }
        this.idVenda = idVenda;
        this.produto = produto;
        this.qtdVenda = qtdVenda;
        this.precoUnitario = preco;
    }
    getIdVenda() {
        return this.idVenda;
    }
    getProduto() {
        return this.produto;
    }
    getCodigoBarras() {
        return this.produto.getCodigoBarras();
    }
    getQtdVenda() {
        return this.qtdVenda;
    }
    setQtdVenda(novaQtd) {
        if ((!Number.isFinite(novaQtd) || novaQtd <= 0)) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
        this.qtdVenda = novaQtd;
    }
    getPrecoUnitario() {
        return this.precoUnitario;
    }
    getSubtotal() {
        return Number((this.qtdVenda * this.precoUnitario).toFixed(2));
    }
}
class PagamentoVenda {
    constructor(idVenda, formaPagamento, valorPago) {
        if ((!Number.isFinite(valorPago) || valorPago <= 0)) {
            throw new Error("O valor pago deve ser maior que zero.");
        }
        this.idVenda = idVenda;
        this.formaPagamento = formaPagamento;
        this.valorPago = Number(valorPago.toFixed(2));
    }
    getIdVenda() {
        return this.idVenda;
    }
    getFormaPagamento() {
        return this.formaPagamento;
    }
    getIdForma() {
        return this.formaPagamento.getIdForma();
    }
    getValorPago() {
        return this.valorPago;
    }
}
class Venda {
    constructor(idVenda, dataHoraVenda, sessaoCaixa, cliente) {
        this.valorTotal = 0;
        this.itens = [];
        this.pagamentos = [];
        this.idVenda = idVenda;
        this.dataHoraVenda = dataHoraVenda;
        this.sessaoCaixa = sessaoCaixa;
        this.cliente = cliente;
    }
    getId() {
        return this.idVenda;
    }
    getIdVenda() {
        return this.idVenda;
    }
    getDataHoraVenda() {
        return this.dataHoraVenda;
    }
    getValorTotal() {
        return this.valorTotal;
    }
    getSessaoCaixa() {
        return this.sessaoCaixa;
    }
    getCliente() {
        return this.cliente;
    }
    setCliente(cliente) {
        this.cliente = cliente;
    }
    getItens() {
        return [...this.itens];
    }
    getPagamentos() {
        return [...this.pagamentos];
    }
    adicionarItem(produto, qtdVenda, precoUnitario) {
        if (!Number.isFinite(qtdVenda) || qtdVenda <= 0) {
            throw new Error("A quantidade vendida deve ser um número finito maior que zero.");
        }
        const existente = this.itens.find((i) => i.getCodigoBarras() === produto.getCodigoBarras());
        if (existente) {
            const novaQtd = Number((existente.getQtdVenda() + qtdVenda).toFixed(3));
            if (novaQtd > produto.getQtdEstoque()) {
                throw new Error(`Estoque insuficiente para "${produto.getDescricaoProduto()}". Disponível: ${produto.getQtdEstoque()}.`);
            }
            existente.setQtdVenda(novaQtd);
        }
        else {
            if (qtdVenda > produto.getQtdEstoque()) {
                throw new Error(`Estoque insuficiente para "${produto.getDescricaoProduto()}". Disponível: ${produto.getQtdEstoque()}.`);
            }
            const novoItem = new ItemVenda(this.idVenda, produto, qtdVenda, precoUnitario);
            this.itens.push(novoItem);
        }
        this.recalcularValorTotal();
    }
    adicionarItemSemValidarEstoque(produto, qtdVenda, precoUnitario) {
        const novoItem = new ItemVenda(this.idVenda, produto, qtdVenda, precoUnitario);
        this.itens.push(novoItem);
        this.recalcularValorTotal();
    }
    adicionarPagamento(forma, valorPago) {
        const novoPag = new PagamentoVenda(this.idVenda, forma, valorPago);
        this.pagamentos.push(novoPag);
    }
    calcularTotalPago() {
        const soma = this.pagamentos.reduce((acc, p) => acc + p.getValorPago(), 0);
        return Number(soma.toFixed(2));
    }
    calcularTroco() {
        const diferenca = this.calcularTotalPago() - this.valorTotal;
        return diferenca > 0 ? Number(diferenca.toFixed(2)) : 0;
    }
    validarVendaParaFinalizacao() {
        if (!this.sessaoCaixa.estaAberta()) {
            throw new Error("A sessão de caixa não está aberta.");
        }
        if (this.itens.length === 0) {
            throw new Error("A venda precisa conter pelo menos um item.");
        }
        if (this.pagamentos.length === 0) {
            throw new Error("A venda precisa ter pelo menos uma forma de pagamento informada.");
        }
        if (this.calcularTotalPago() < this.valorTotal) {
            const faltante = (this.valorTotal - this.calcularTotalPago()).toFixed(2);
            throw new Error(`O valor pago (R$ ${this.calcularTotalPago().toFixed(2)}) é menor que o total da venda (R$ ${this.valorTotal.toFixed(2)}). Faltam R$ ${faltante}.`);
        }
    }
    recalcularValorTotal() {
        const soma = this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
        this.valorTotal = Number(soma.toFixed(2));
    }
}


// --- GerenciadorSistema.js ---



class GerenciadorSistema {
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


// --- ControladorInterface.js ---

class ControladorInterface {
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


// --- main.js ---


function iniciarAplicacao() {
    const sistema = new GerenciadorSistema(true);
    const controlador = new ControladorInterface(sistema);
    controlador.inicializar();
}
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarAplicacao);
    }
    else {
        iniciarAplicacao();
    }
}


})();
