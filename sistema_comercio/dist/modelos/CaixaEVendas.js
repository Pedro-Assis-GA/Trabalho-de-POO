import { StatusCaixa } from "./Entidades.js";
export class SessaoCaixa {
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
export class ItemVenda {
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
export class PagamentoVenda {
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
export class Venda {
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
