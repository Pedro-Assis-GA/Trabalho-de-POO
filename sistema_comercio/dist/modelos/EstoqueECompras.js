export class Produto {
    constructor(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoque, estoqueMinimo, categoria, dataValidade, fornecedores = []) {
        this.fornecedores = [];
        if (!codigoBarras || codigoBarras.trim() === "") {
            throw new Error("O código de barras do produto é obrigatório.");
        }
        if (!descricaoProduto || descricaoProduto.trim() === "") {
            throw new Error("A descrição do produto é obrigatória.");
        }
        if (precoVenda < 0 || custoProduto < 0) {
            throw new Error("Preço de venda e custo não podem ser negativos.");
        }
        if (qtdEstoque < 0 || estoqueMinimo < 0) {
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
        if (novoPreco < 0) {
            throw new Error("O preço de venda não pode ser negativo.");
        }
        this.precoVenda = novoPreco;
    }
    getCustoProduto() {
        return this.custoProduto;
    }
    setCustoProduto(novoCusto) {
        if (novoCusto < 0) {
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
        if (minimo < 0) {
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
        if (quantidade <= 0) {
            throw new Error("A quantidade de entrada no estoque deve ser maior que zero.");
        }
        this.qtdEstoque = Number((this.qtdEstoque + quantidade).toFixed(3));
    }
    removerEstoque(quantidade) {
        if (quantidade <= 0) {
            throw new Error("A quantidade de saída do estoque deve ser maior que zero.");
        }
        if (quantidade > this.qtdEstoque) {
            throw new Error(`Estoque insuficiente para o produto "${this.descricaoProduto}". Disponível: ${this.qtdEstoque} ${this.unidadeMedida}.`);
        }
        this.qtdEstoque = Number((this.qtdEstoque - quantidade).toFixed(3));
    }
    definirEstoquePorAjuste(novaQuantidade) {
        if (novaQuantidade < 0) {
            throw new Error("A quantidade em estoque após ajuste não pode ser negativa.");
        }
        this.qtdEstoque = Number(novaQuantidade.toFixed(3));
    }
}
export class MovimentacaoEstoque {
    constructor(idMovimentacao, dataHoraMov, tipo, qtdMovimentacao, produto, funcionarioResponsavel) {
        if (qtdMovimentacao <= 0) {
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
export class ItemCompra {
    constructor(idCompra, produto, qtdCompra, custoUnitario) {
        if (qtdCompra <= 0) {
            throw new Error("A quantidade comprada deve ser maior que zero.");
        }
        if (custoUnitario < 0) {
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
export class Compra {
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
