import {
    Categoria,
    Documento,
    EntidadeIdentificavel,
    Fornecedor,
    Funcionario,
    TipoMovimentacao
} from "./Entidades.js";

export class Produto implements EntidadeIdentificavel<string> {
    private ativo: boolean;
    private codigoBarras: string;
    private descricaoProduto: string;
    private precoVenda: number;
    private custoProduto: number;
    private unidadeMedida: string;
    private qtdEstoque: number;
    private estoqueMinimo: number;
    private dataValidade?: string;
    private categoria: Categoria;
    private fornecedores: Fornecedor[] = [];

    constructor(
        codigoBarras: string,
        descricaoProduto: string,
        precoVenda: number,
        custoProduto: number,
        unidadeMedida: string,
        qtdEstoque: number,
        estoqueMinimo: number,
        categoria: Categoria,
        dataValidade?: string,
        fornecedores: Fornecedor[] = [],
        ativo: boolean = true
    ) {
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
        if (typeof ativo !== "boolean" || (!ativo && qtdEstoque > 0)) throw new Error("Situação do produto inválida: removido deve ter estoque zero.");
        this.ativo = ativo;
        this.dataValidade = dataValidade && dataValidade.trim() !== "" ? Documento.validarDataISO(dataValidade.trim()) : undefined;
        fornecedores.forEach((f) => this.vincularFornecedor(f));
    }

    public getId(): string {
        return this.codigoBarras;
    }

    public getCodigoBarras(): string {
        return this.codigoBarras;
    }

    public getDescricaoProduto(): string {
        return this.descricaoProduto;
    }

    public setDescricaoProduto(descricao: string): void {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A descrição do produto não pode ser vazia.");
        }
        this.descricaoProduto = descricao.trim();
    }

    public getPrecoVenda(): number {
        return this.precoVenda;
    }

    public setPrecoVenda(novoPreco: number): void {
        if ((!Number.isFinite(novoPreco) || novoPreco < 0)) {
            throw new Error("O preço de venda não pode ser negativo.");
        }
        this.precoVenda = novoPreco;
    }

    public getCustoProduto(): number {
        return this.custoProduto;
    }

    public setCustoProduto(novoCusto: number): void {
        if ((!Number.isFinite(novoCusto) || novoCusto < 0)) {
            throw new Error("O custo do produto não pode ser negativo.");
        }
        this.custoProduto = novoCusto;
    }

    public getUnidadeMedida(): string {
        return this.unidadeMedida;
    }

    public getQtdEstoque(): number {
        return this.qtdEstoque;
    }

    public getEstoqueMinimo(): number {
        return this.estoqueMinimo;
    }

    public setEstoqueMinimo(minimo: number): void {
        if ((!Number.isFinite(minimo) || minimo < 0)) {
            throw new Error("O estoque mínimo não pode ser negativo.");
        }
        this.estoqueMinimo = minimo;
    }

    public getDataValidade(): string | undefined {
        return this.dataValidade;
    }

    public estaAtivo(): boolean { return this.ativo; }
    public inativar(): void {
        if (!this.ativo) throw new Error("Produto já removido.");
        if (this.qtdEstoque > 0) throw new Error("Dê baixa no estoque antes de remover o produto.");
        this.ativo = false;
    }
    public exigirAtivo(): void { if (!this.ativo) throw new Error("Produto removido não permite novas operações."); }

    public corrigirDataValidade(novaData: string, motivo: string): void {
        this.exigirAtivo();
        const data = Documento.validarDataISO(novaData);
        CorrecaoValidade.validarMotivo(motivo);
        if (data === this.dataValidade) throw new Error("A nova validade deve ser diferente da atual.");
        this.dataValidade = data;
    }

    public getCategoria(): Categoria {
        return this.categoria;
    }

    public getFornecedores(): Fornecedor[] {
        return [...this.fornecedores];
    }

    public vincularFornecedor(fornecedor: Fornecedor): void {
        const jaExiste = this.fornecedores.some(
            (f) => f.getIdFornecedor() === fornecedor.getIdFornecedor()
        );
        if (!jaExiste) {
            this.fornecedores.push(fornecedor);
        }
    }

    public abaixoDoEstoqueMinimo(): boolean {
        return this.qtdEstoque <= this.estoqueMinimo;
    }

    public estaVencido(dataReferencia: Date = new Date()): boolean {
        if (!this.dataValidade) {
            return false;
        }
        const validade = new Date(this.dataValidade + "T23:59:59");
        return validade.getTime() < dataReferencia.getTime();
    }

    public adicionarEstoque(quantidade: number): void {
        this.exigirAtivo();
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de entrada no estoque deve ser maior que zero.");
        }
        this.qtdEstoque = Number((this.qtdEstoque + quantidade).toFixed(3));
    }

    public removerEstoque(quantidade: number): void {
        this.exigirAtivo();
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de saída do estoque deve ser maior que zero.");
        }
        if (quantidade > this.qtdEstoque) {
            throw new Error(
                `Estoque insuficiente para o produto "${this.descricaoProduto}". Disponível: ${this.qtdEstoque} ${this.unidadeMedida}.`
            );
        }
        this.qtdEstoque = Number((this.qtdEstoque - quantidade).toFixed(3));
    }

    public definirEstoquePorAjuste(novaQuantidade: number): void {
        this.exigirAtivo();
        if ((!Number.isFinite(novaQuantidade) || novaQuantidade < 0)) {
            throw new Error("A quantidade em estoque após ajuste não pode ser negativa.");
        }
        this.qtdEstoque = Number(novaQuantidade.toFixed(3));
    }
}

export interface RegistroCorrecaoValidade {
    id: number;
    dataHora: string;
    codigoBarras: string;
    descricaoProduto: string;
    validadeAnterior?: string;
    novaValidade: string;
    motivo: string;
    idFuncionario: number;
    nomeFuncionario: string;
}

export class CorrecaoValidade {
    private readonly registro: Readonly<RegistroCorrecaoValidade>;

    public static validarMotivo(motivo: string): string {
        if (typeof motivo !== "string" || motivo.trim().length < 5 || motivo.trim().length > 500) {
            throw new Error("Informe um motivo entre 5 e 500 caracteres para a correção.");
        }
        return motivo.trim();
    }

    constructor(registro: RegistroCorrecaoValidade) {
        this.registro = Object.freeze({
            id: registro.id, dataHora: registro.dataHora,
            codigoBarras: registro.codigoBarras, descricaoProduto: registro.descricaoProduto,
            validadeAnterior: registro.validadeAnterior,
            novaValidade: Documento.validarDataISO(registro.novaValidade),
            motivo: CorrecaoValidade.validarMotivo(registro.motivo),
            idFuncionario: registro.idFuncionario, nomeFuncionario: registro.nomeFuncionario
        });
        Object.freeze(this);
    }

    public getRegistro(): RegistroCorrecaoValidade { return { ...this.registro }; }
}

export class MovimentacaoEstoque implements EntidadeIdentificavel<number> {
    private idMovimentacao: number;
    private dataHoraMov: string;
    private tipo: TipoMovimentacao;
    private qtdMovimentacao: number;
    private produto: Produto;
    private funcionarioResponsavel: Funcionario;

    constructor(
        idMovimentacao: number,
        dataHoraMov: string,
        tipo: TipoMovimentacao,
        qtdMovimentacao: number,
        produto: Produto,
        funcionarioResponsavel: Funcionario
    ) {
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

    public getId(): number {
        return this.idMovimentacao;
    }

    public getIdMovimentacao(): number {
        return this.idMovimentacao;
    }

    public getDataHoraMov(): string {
        return this.dataHoraMov;
    }

    public getTipo(): TipoMovimentacao {
        return this.tipo;
    }

    public getQtdMovimentacao(): number {
        return this.qtdMovimentacao;
    }

    public getProduto(): Produto {
        return this.produto;
    }

    public getCodigoBarras(): string {
        return this.produto.getCodigoBarras();
    }

    public getFuncionarioResponsavel(): Funcionario {
        return this.funcionarioResponsavel;
    }
}

export class ItemCompra {
    private idCompra: number;
    private produto: Produto;
    private qtdCompra: number;
    private custoUnitario: number;

    constructor(
        idCompra: number,
        produto: Produto,
        qtdCompra: number,
        custoUnitario: number
    ) {
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

    public getIdCompra(): number {
        return this.idCompra;
    }

    public getProduto(): Produto {
        return this.produto;
    }

    public getCodigoBarras(): string {
        return this.produto.getCodigoBarras();
    }

    public getQtdCompra(): number {
        return this.qtdCompra;
    }

    public getCustoUnitario(): number {
        return this.custoUnitario;
    }

    public getSubtotal(): number {
        return Number((this.qtdCompra * this.custoUnitario).toFixed(2));
    }
}

export class Compra implements EntidadeIdentificavel<number> {
    private idCompra: number;
    private dataCompra: string;
    private valorTotal: number = 0;
    private fornecedor: Fornecedor;
    private funcionarioResponsavel: Funcionario;
    private itens: ItemCompra[] = [];

    constructor(
        idCompra: number,
        dataCompra: string,
        fornecedor: Fornecedor,
        funcionarioResponsavel: Funcionario
    ) {
        this.idCompra = idCompra;
        this.dataCompra = dataCompra;
        this.fornecedor = fornecedor;
        this.funcionarioResponsavel = funcionarioResponsavel;
    }

    public getId(): number {
        return this.idCompra;
    }

    public getIdCompra(): number {
        return this.idCompra;
    }

    public getDataCompra(): string {
        return this.dataCompra;
    }

    public getValorTotal(): number {
        return this.valorTotal;
    }

    public getFornecedor(): Fornecedor {
        return this.fornecedor;
    }

    public getFuncionarioResponsavel(): Funcionario {
        return this.funcionarioResponsavel;
    }

    public getItens(): ItemCompra[] {
        return [...this.itens];
    }

    public adicionarItem(produto: Produto, qtdCompra: number, custoUnitario: number): void {
        const novoItem = new ItemCompra(this.idCompra, produto, qtdCompra, custoUnitario);
        this.itens.push(novoItem);
        this.recalcularValorTotal();
    }

    private recalcularValorTotal(): void {
        const soma = this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
        this.valorTotal = Number(soma.toFixed(2));
    }
}
