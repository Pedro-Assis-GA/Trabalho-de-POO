import {
    Caixa,
    Cliente,
    EntidadeIdentificavel,
    FormaPagamento,
    Funcionario,
    StatusCaixa
} from "./Entidades.js";
import { Produto } from "./EstoqueECompras.js";

export class SessaoCaixa implements EntidadeIdentificavel<number> {
    private idSessao: number;
    private dataAbertura: string;
    private dataFechamento?: string;
    private valorInicial: number;
    private valorFinal?: number;
    private esperadoNoFechamento?: number;
    private valorConferido?: number;
    private idResponsavelFechamento?: number;
    private funcionario: Funcionario;
    private caixa: Caixa;
    private vendas: Venda[] = [];

    constructor(
        idSessao: number,
        dataAbertura: string,
        valorInicial: number,
        funcionario: Funcionario,
        caixa: Caixa,
        origem: "novo" | "historico" = "novo"
    ) {
        if ((!Number.isFinite(valorInicial) || valorInicial < 0)) {
            throw new Error("O valor inicial da sessão de caixa não pode ser negativo.");
        }
        if (origem === "novo" && !funcionario.podeOperarCaixa()) throw new Error("Funcionário sem autorização para operar o caixa.");
        this.idSessao = idSessao;
        this.dataAbertura = dataAbertura;
        this.valorInicial = Number(valorInicial.toFixed(2));
        this.funcionario = funcionario;
        this.caixa = caixa;
        this.caixa.setStatusCaixa(StatusCaixa.OCUPADO);
    }

    public getId(): number {
        return this.idSessao;
    }

    public getIdSessao(): number {
        return this.idSessao;
    }

    public getDataAbertura(): string {
        return this.dataAbertura;
    }

    public getDataFechamento(): string | undefined {
        return this.dataFechamento;
    }

    public getValorInicial(): number {
        return this.valorInicial;
    }

    public getValorFinal(): number | undefined {
        return this.valorFinal;
    }

    public getFuncionario(): Funcionario {
        return this.funcionario;
    }

    public getIdResponsavelFechamento(): number | undefined { return this.idResponsavelFechamento; }

    public getCaixa(): Caixa {
        return this.caixa;
    }

    public getVendas(): Venda[] {
        return [...this.vendas];
    }

    public estaAberta(): boolean {
        return this.dataFechamento === undefined;
    }

    public vincularVenda(venda: Venda): void {
        if (!this.estaAberta()) {
            throw new Error("Não é possível registrar venda em uma sessão de caixa já fechada.");
        }
        this.vendas.push(venda);
    }

    public restaurarVenda(venda: Venda): void {
        this.vendas.push(venda);
    }

    public calcularTotalVendas(): number {
        const total = this.vendas.reduce((acc, v) => acc + v.getValorTotal(), 0);
        return Number(total.toFixed(2));
    }

    public calcularSaldoEsperado(): number {
        return Number((this.valorInicial + this.vendas.reduce((soma, venda) => soma + venda.calcularDinheiroLiquido(), 0)).toFixed(2));
    }

    public calcularSaldoConsolidado(): number {
        return Number((this.valorInicial + this.calcularTotalVendas()).toFixed(2));
    }

    public calcularTotalDigital(): number {
        return Number(this.vendas.reduce((soma, venda) => soma + venda.calcularTotalDigital(), 0).toFixed(2));
    }

    public getEsperadoNoFechamento(): number | undefined { return this.esperadoNoFechamento; }
    public getValorConferido(): number | undefined { return this.valorConferido; }
    public calcularDiferencaFechamento(): number | undefined {
        return this.valorConferido !== undefined && this.esperadoNoFechamento !== undefined
            ? Number((this.valorConferido - this.esperadoNoFechamento).toFixed(2)) : undefined;
    }

    public fecharSessao(dataFechamento: string, valorFinalConferido?: number, idResponsavel?: number): number {
        if (!this.estaAberta()) {
            throw new Error("Esta sessão de caixa já foi fechada.");
        }
        if (valorFinalConferido !== undefined && (!Number.isFinite(valorFinalConferido) || valorFinalConferido < 0)) {
            throw new Error("O valor conferido deve ser um número finito não negativo.");
        }
        this.dataFechamento = dataFechamento;
        this.idResponsavelFechamento = idResponsavel;
        const saldoCalculado = this.calcularSaldoEsperado();
        this.esperadoNoFechamento = saldoCalculado;
        this.valorConferido = valorFinalConferido === undefined ? undefined : Number(valorFinalConferido.toFixed(2));
        this.valorFinal = valorFinalConferido !== undefined
            ? Number(valorFinalConferido.toFixed(2))
            : saldoCalculado;
        this.caixa.setStatusCaixa(StatusCaixa.LIVRE);
        return this.valorFinal;
    }

    public restaurarFechamento(dataFechamento?: string, valorFinal?: number, esperadoNoFechamento?: number, valorConferido?: number, idResponsavel?: number): void {
        this.dataFechamento = dataFechamento;
        this.valorFinal = valorFinal;
        this.esperadoNoFechamento = esperadoNoFechamento;
        this.valorConferido = valorConferido;
        this.idResponsavelFechamento = idResponsavel;
        if (dataFechamento) {
            this.caixa.setStatusCaixa(StatusCaixa.LIVRE);
        } else {
            this.caixa.setStatusCaixa(StatusCaixa.OCUPADO);
        }
    }
}

export class ItemVenda {
    private idVenda: number;
    private produto: Produto;
    private qtdVenda: number;
    private precoUnitario: number;

    constructor(
        idVenda: number,
        produto: Produto,
        qtdVenda: number,
        precoUnitario?: number
    ) {
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

    public getIdVenda(): number {
        return this.idVenda;
    }

    public getProduto(): Produto {
        return this.produto;
    }

    public getCodigoBarras(): string {
        return this.produto.getCodigoBarras();
    }

    public getQtdVenda(): number {
        return this.qtdVenda;
    }

    public setQtdVenda(novaQtd: number): void {
        if ((!Number.isFinite(novaQtd) || novaQtd <= 0)) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
        this.qtdVenda = novaQtd;
    }

    public getPrecoUnitario(): number {
        return this.precoUnitario;
    }

    public getSubtotal(): number {
        return Number((this.qtdVenda * this.precoUnitario).toFixed(2));
    }
}

export class PagamentoVenda {
    private idVenda: number;
    private formaPagamento: FormaPagamento;
    private valorPago: number;

    constructor(idVenda: number, formaPagamento: FormaPagamento, valorPago: number) {
        if ((!Number.isFinite(valorPago) || valorPago <= 0)) {
            throw new Error("O valor pago deve ser maior que zero.");
        }
        this.idVenda = idVenda;
        this.formaPagamento = formaPagamento;
        this.valorPago = Number(valorPago.toFixed(2));
    }

    public getIdVenda(): number {
        return this.idVenda;
    }

    public getFormaPagamento(): FormaPagamento {
        return this.formaPagamento;
    }

    public getIdForma(): number {
        return this.formaPagamento.getIdForma();
    }

    public getValorPago(): number {
        return this.valorPago;
    }
}

export class Venda implements EntidadeIdentificavel<number> {
    private operadorVenda: Funcionario;
    private operadorRegistrado: boolean;
    private idVenda: number;
    private dataHoraVenda: string;
    private valorTotal: number = 0;
    private sessaoCaixa: SessaoCaixa;
    private cliente?: Cliente;
    private itens: ItemVenda[] = [];
    private pagamentos: PagamentoVenda[] = [];

    constructor(
        idVenda: number,
        dataHoraVenda: string,
        sessaoCaixa: SessaoCaixa,
        cliente?: Cliente,
        operadorVenda?: Funcionario
    ) {
        this.idVenda = idVenda;
        this.dataHoraVenda = dataHoraVenda;
        this.sessaoCaixa = sessaoCaixa;
        this.cliente = cliente;
        this.operadorVenda = operadorVenda ?? sessaoCaixa.getFuncionario();
        this.operadorRegistrado = operadorVenda !== undefined;
    }

    public getId(): number {
        return this.idVenda;
    }

    public getIdVenda(): number {
        return this.idVenda;
    }

    public getDataHoraVenda(): string {
        return this.dataHoraVenda;
    }

    public getValorTotal(): number {
        return this.valorTotal;
    }

    public getSessaoCaixa(): SessaoCaixa {
        return this.sessaoCaixa;
    }

    public getCliente(): Cliente | undefined {
        return this.cliente;
    }

    public setCliente(cliente?: Cliente): void {
        this.cliente = cliente;
    }

    public getItens(): ItemVenda[] {
        return [...this.itens];
    }

    public getOperadorVenda(): Funcionario { return this.operadorVenda; }
    public getIdOperadorRegistrado(): number | undefined { return this.operadorRegistrado ? this.operadorVenda.getIdFuncionario() : undefined; }

    public getPagamentos(): PagamentoVenda[] {
        return [...this.pagamentos];
    }

    public adicionarItem(produto: Produto, qtdVenda: number, precoUnitario?: number): void {
        produto.exigirAtivo();
        if (produto.estaVencido()) throw new Error(`Produto vencido: ${produto.getDescricaoProduto()}. Venda bloqueada.`);
        if (!Number.isFinite(qtdVenda) || qtdVenda <= 0) {
            throw new Error("A quantidade vendida deve ser um número finito maior que zero.");
        }
        const existente = this.itens.find(
            (i) => i.getCodigoBarras() === produto.getCodigoBarras()
        );
        if (existente) {
            const novaQtd = Number((existente.getQtdVenda() + qtdVenda).toFixed(3));
            if (novaQtd > produto.getQtdEstoque()) {
                throw new Error(
                    `Estoque insuficiente para "${produto.getDescricaoProduto()}". Disponível: ${produto.getQtdEstoque()}.`
                );
            }
            existente.setQtdVenda(novaQtd);
        } else {
            if (qtdVenda > produto.getQtdEstoque()) {
                throw new Error(
                    `Estoque insuficiente para "${produto.getDescricaoProduto()}". Disponível: ${produto.getQtdEstoque()}.`
                );
            }
            const novoItem = new ItemVenda(this.idVenda, produto, qtdVenda, precoUnitario);
            this.itens.push(novoItem);
        }
        this.recalcularValorTotal();
    }

    public adicionarItemSemValidarEstoque(
        produto: Produto,
        qtdVenda: number,
        precoUnitario: number
    ): void {
        const novoItem = new ItemVenda(this.idVenda, produto, qtdVenda, precoUnitario);
        this.itens.push(novoItem);
        this.recalcularValorTotal();
    }

    public adicionarPagamento(forma: FormaPagamento, valorPago: number): void {
        const novoPag = new PagamentoVenda(this.idVenda, forma, valorPago);
        this.pagamentos.push(novoPag);
    }

    public calcularTotalPago(): number {
        const soma = this.pagamentos.reduce((acc, p) => acc + p.getValorPago(), 0);
        return Number(soma.toFixed(2));
    }

    public calcularTroco(): number {
        const diferenca = Math.max(0, Math.round(this.calcularTotalPago() * 100) - Math.round(this.valorTotal * 100));
        return Math.min(diferenca, Math.round(this.calcularTotalDinheiro() * 100)) / 100;
    }

    public calcularTotalDinheiro(): number {
        return this.pagamentos.filter(p => p.getFormaPagamento().permiteTroco())
            .reduce((soma, p) => soma + Math.round(p.getValorPago() * 100), 0) / 100;
    }

    public calcularTotalDigital(): number {
        return this.pagamentos.filter(p => !p.getFormaPagamento().permiteTroco())
            .reduce((soma, p) => soma + Math.round(p.getValorPago() * 100), 0) / 100;
    }

    public calcularDinheiroLiquido(): number {
        return Number((this.calcularTotalDinheiro() - this.calcularTroco()).toFixed(2));
    }

    public validarVendaParaFinalizacao(): void {
        if (!this.operadorVenda.podeOperarCaixa()) throw new Error("Responsável da venda sem autorização para operar o caixa.");
        if (!this.operadorVenda.ehGerente() && this.operadorVenda.getIdFuncionario() !== this.sessaoCaixa.getFuncionario().getIdFuncionario()) throw new Error("Sessão pertence a outro funcionário.");
        if (!this.sessaoCaixa.estaAberta()) {
            throw new Error("A sessão de caixa não está aberta.");
        }
        if (this.itens.length === 0) {
            throw new Error("A venda precisa conter pelo menos um item.");
        }
        if (this.pagamentos.length === 0) {
            throw new Error("A venda precisa ter pelo menos uma forma de pagamento informada.");
        }
        if (Math.round(this.calcularTotalDigital() * 100) > Math.round(this.valorTotal * 100)) {
            throw new Error("PIX e cartões não podem ultrapassar o total da venda. Troco é permitido apenas em dinheiro.");
        }
        for (const item of this.itens) {
            item.getProduto().exigirAtivo();
            if (item.getProduto().estaVencido()) throw new Error(`Produto vencido: ${item.getProduto().getDescricaoProduto()}. Venda bloqueada.`);
            if (item.getQtdVenda() > item.getProduto().getQtdEstoque()) throw new Error("Estoque insuficiente na finalização da venda.");
        }
        if (this.calcularTotalPago() < this.valorTotal) {
            const faltante = (this.valorTotal - this.calcularTotalPago()).toFixed(2);
            throw new Error(
                `O valor pago (R$ ${this.calcularTotalPago().toFixed(2)}) é menor que o total da venda (R$ ${this.valorTotal.toFixed(2)}). Faltam R$ ${faltante}.`
            );
        }
    }

    private recalcularValorTotal(): void {
        const soma = this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
        this.valorTotal = Number(soma.toFixed(2));
    }
}
