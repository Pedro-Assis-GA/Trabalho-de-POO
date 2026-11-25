// Bundle gerado automaticamente a partir do código TypeScript (POO)
(() => {

// --- Entidades.js ---
/** Validações do domínio para novos cadastros. Não confirma titularidade do documento. */
class Documento {
    static normalizar(valor) {
        return valor.trim().replace(/[.\-\/\s]/g, "");
    }
    static validarCPF(valor) {
        const cpf = Documento.normalizar(valor);
        if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf))
            throw new Error("CPF inválido.");
        for (let tamanho = 9; tamanho <= 10; tamanho++) {
            let soma = 0;
            for (let i = 0; i < tamanho; i++)
                soma += Number(cpf[i]) * (tamanho + 1 - i);
            const resto = (soma * 10) % 11;
            if ((resto === 10 ? 0 : resto) !== Number(cpf[tamanho]))
                throw new Error("CPF inválido.");
        }
        return cpf;
    }
    static validarCNPJ(valor) {
        const cnpj = Documento.normalizar(valor);
        if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj))
            throw new Error("CNPJ numérico inválido.");
        for (let tamanho = 12; tamanho <= 13; tamanho++) {
            let peso = tamanho - 7, soma = 0;
            for (let i = 0; i < tamanho; i++) {
                soma += Number(cnpj[i]) * peso--;
                if (peso === 1)
                    peso = 9;
            }
            const resto = soma % 11;
            if ((resto < 2 ? 0 : 11 - resto) !== Number(cnpj[tamanho]))
                throw new Error("CNPJ numérico inválido.");
        }
        return cnpj;
    }
    static validarDataISO(valor) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || !Number.isFinite(Date.parse(valor + "T00:00:00Z")) ||
            new Date(valor + "T00:00:00Z").toISOString().slice(0, 10) !== valor) {
            throw new Error("Data inválida. Use uma data real no formato AAAA-MM-DD.");
        }
        return valor;
    }
}
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
var ModuloSistema;
(function (ModuloSistema) {
    ModuloSistema["CAIXA"] = "CAIXA";
    ModuloSistema["ESTOQUE"] = "ESTOQUE";
    ModuloSistema["COMPRAS"] = "COMPRAS";
    ModuloSistema["EQUIPE"] = "EQUIPE";
})(ModuloSistema || (ModuloSistema = {}));
class Cargo {
    constructor(idCargo, nomeCargo, salarioBase, permissoes = []) {
        if (!nomeCargo || nomeCargo.trim() === "") {
            throw new Error("O nome do cargo é obrigatório.");
        }
        if ((!Number.isFinite(salarioBase) || salarioBase < 0)) {
            throw new Error("O salário base não pode ser negativo.");
        }
        this.idCargo = idCargo;
        this.nomeCargo = nomeCargo.trim();
        this.salarioBase = salarioBase;
        this.permissoes = Cargo.validarPermissoes(permissoes);
    }
    static validarModulo(modulo) {
        if (!Object.values(ModuloSistema).includes(modulo))
            throw new Error("Módulo de autorização inválido.");
        return modulo;
    }
    static validarPermissoes(permissoes) {
        if (!Array.isArray(permissoes))
            throw new Error("Lista de permissões inválida.");
        return [...new Set(permissoes.map(p => Cargo.validarModulo(p)))];
    }
    static permissoesLegadas(nome) {
        const normalizado = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
        if (normalizado === "operador de caixa")
            return [ModuloSistema.CAIXA];
        if (/^gerente(?: |$)/.test(normalizado))
            return [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS, ModuloSistema.EQUIPE];
        if (normalizado === "auxiliar de estoque")
            return [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS];
        return [];
    }
    getPermissoes() { return [...this.permissoes]; }
    permite(modulo) { return this.permissoes.includes(Cargo.validarModulo(modulo)); }
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
    constructor(idFuncionario, cpfFuncionario, nomeFuncionario, senha, dataAdmissao, cargo, telefones = [], origem = "novo", autorizadoNoCaixa = false, autorizacoesIndividuais) {
        this.telefones = [];
        if (!nomeFuncionario || nomeFuncionario.trim() === "") {
            throw new Error("O nome do funcionário é obrigatório.");
        }
        if (!cpfFuncionario || cpfFuncionario.trim() === "") {
            throw new Error("O CPF do funcionário é obrigatório.");
        }
        this.idFuncionario = idFuncionario;
        this.cpfFuncionario = origem === "historico" ? cpfFuncionario.trim() : Documento.validarCPF(cpfFuncionario);
        this.nomeFuncionario = nomeFuncionario.trim();
        this.senha = senha;
        this.dataAdmissao = origem === "historico" ? dataAdmissao : Documento.validarDataISO(dataAdmissao);
        this.cargo = cargo;
        if (typeof autorizadoNoCaixa !== "boolean")
            throw new Error("Autorização de caixa inválida.");
        this.autorizacoesIndividuais = Cargo.validarPermissoes(autorizacoesIndividuais !== undefined ? autorizacoesIndividuais : (autorizadoNoCaixa ? [ModuloSistema.CAIXA] : []));
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
    nomeCargoNormalizado() {
        return this.cargo.getNomeCargo().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
    }
    ehOperadorDeCaixa() { return this.cargo.permite(ModuloSistema.CAIXA); }
    ehGerente() { return /^gerente(?: |$)/.test(this.nomeCargoNormalizado()); }
    getAutorizacoesIndividuais() { return [...this.autorizacoesIndividuais]; }
    temAutorizacaoModulo(modulo) { return this.autorizacoesIndividuais.includes(Cargo.validarModulo(modulo)); }
    temAcessoModulo(modulo) { Cargo.validarModulo(modulo); return this.ehGerente() || this.cargo.permite(modulo) || this.temAutorizacaoModulo(modulo); }
    temAutorizacaoCaixa() { return this.temAutorizacaoModulo(ModuloSistema.CAIXA); }
    podeOperarCaixa() { return this.temAcessoModulo(ModuloSistema.CAIXA); }
    alterarAutorizacaoCaixa(permitir, responsavel) {
        this.alterarAutorizacaoModulo(ModuloSistema.CAIXA, permitir, responsavel);
    }
    alterarAutorizacaoModulo(modulo, permitir, responsavel) {
        Cargo.validarModulo(modulo);
        if (!responsavel.ehGerente())
            throw new Error("Somente um gerente pode conceder ou revogar autorizações.");
        if (typeof permitir !== "boolean")
            throw new Error("Autorização inválida.");
        if (this.ehGerente())
            throw new Error("Gerente já possui acesso a todos os módulos.");
        if (this.cargo.permite(modulo))
            throw new Error("Permissão já habilitada pelo cargo; autorizações individuais são complementares.");
        if (permitir === this.temAutorizacaoModulo(modulo))
            throw new Error("A autorização já está nesse estado.");
        this.autorizacoesIndividuais = permitir ? [...this.autorizacoesIndividuais, modulo] : this.autorizacoesIndividuais.filter(p => p !== modulo);
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
        return this.senha !== "" && this.senha === senhaInformada;
    }
    getSenha() {
        return this.senha;
    }
}
class Fornecedor {
    constructor(idFornecedor, cnpj, razaoSocial, email, telefones = [], origem = "novo", ativo = true) {
        this.telefones = [];
        if (!razaoSocial || razaoSocial.trim() === "") {
            throw new Error("A razão social do fornecedor é obrigatória.");
        }
        if (!cnpj || cnpj.trim() === "") {
            throw new Error("O CNPJ do fornecedor é obrigatório.");
        }
        this.idFornecedor = idFornecedor;
        this.cnpj = origem === "historico" ? cnpj.trim() : Documento.validarCNPJ(cnpj);
        this.razaoSocial = razaoSocial.trim();
        this.email = email.trim();
        if (typeof ativo !== "boolean")
            throw new Error("Situação do fornecedor inválida.");
        this.ativo = ativo;
        telefones.forEach((t) => this.adicionarTelefone(t));
    }
    getId() {
        return this.idFornecedor;
    }
    getIdFornecedor() {
        return this.idFornecedor;
    }
    estaAtivo() { return this.ativo; }
    inativar() {
        if (!this.ativo)
            throw new Error("Fornecedor já removido.");
        this.ativo = false;
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
    constructor(idCliente, nomeCliente, telefoneCliente, cpfCliente, origem = "novo") {
        if (!nomeCliente || nomeCliente.trim() === "") {
            throw new Error("O nome do cliente é obrigatório.");
        }
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente.trim();
        this.telefoneCliente = telefoneCliente.trim();
        this.cpfCliente = origem === "historico" ? cpfCliente.trim() : Documento.validarCPF(cpfCliente);
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
    permiteTroco() {
        return this.descricao.trim().toLocaleLowerCase("pt-BR") === "dinheiro";
    }
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
        if ((!Number.isInteger(numeroCaixa) || numeroCaixa <= 0)) {
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
    constructor(codigoBarras, descricaoProduto, precoVenda, custoProduto, unidadeMedida, qtdEstoque, estoqueMinimo, categoria, dataValidade, fornecedores = [], ativo = true) {
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
        if (typeof ativo !== "boolean" || (!ativo && qtdEstoque > 0))
            throw new Error("Situação do produto inválida: removido deve ter estoque zero.");
        this.ativo = ativo;
        this.dataValidade = dataValidade && dataValidade.trim() !== "" ? Documento.validarDataISO(dataValidade.trim()) : undefined;
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
    estaAtivo() { return this.ativo; }
    inativar() {
        if (!this.ativo)
            throw new Error("Produto já removido.");
        if (this.qtdEstoque > 0)
            throw new Error("Dê baixa no estoque antes de remover o produto.");
        this.ativo = false;
    }
    exigirAtivo() { if (!this.ativo)
        throw new Error("Produto removido não permite novas operações."); }
    corrigirDataValidade(novaData, motivo) {
        this.exigirAtivo();
        const data = Documento.validarDataISO(novaData);
        CorrecaoValidade.validarMotivo(motivo);
        if (data === this.dataValidade)
            throw new Error("A nova validade deve ser diferente da atual.");
        this.dataValidade = data;
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
        this.exigirAtivo();
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de entrada no estoque deve ser maior que zero.");
        }
        this.qtdEstoque = Number((this.qtdEstoque + quantidade).toFixed(3));
    }
    removerEstoque(quantidade) {
        this.exigirAtivo();
        if ((!Number.isFinite(quantidade) || quantidade <= 0)) {
            throw new Error("A quantidade de saída do estoque deve ser maior que zero.");
        }
        if (quantidade > this.qtdEstoque) {
            throw new Error(`Estoque insuficiente para o produto "${this.descricaoProduto}". Disponível: ${this.qtdEstoque} ${this.unidadeMedida}.`);
        }
        this.qtdEstoque = Number((this.qtdEstoque - quantidade).toFixed(3));
    }
    definirEstoquePorAjuste(novaQuantidade) {
        this.exigirAtivo();
        if ((!Number.isFinite(novaQuantidade) || novaQuantidade < 0)) {
            throw new Error("A quantidade em estoque após ajuste não pode ser negativa.");
        }
        this.qtdEstoque = Number(novaQuantidade.toFixed(3));
    }
}
class CorrecaoValidade {
    static validarMotivo(motivo) {
        if (typeof motivo !== "string" || motivo.trim().length < 5 || motivo.trim().length > 500) {
            throw new Error("Informe um motivo entre 5 e 500 caracteres para a correção.");
        }
        return motivo.trim();
    }
    constructor(registro) {
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
    getRegistro() { return { ...this.registro }; }
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
    constructor(idSessao, dataAbertura, valorInicial, funcionario, caixa, origem = "novo") {
        this.vendas = [];
        if ((!Number.isFinite(valorInicial) || valorInicial < 0)) {
            throw new Error("O valor inicial da sessão de caixa não pode ser negativo.");
        }
        if (origem === "novo" && !funcionario.podeOperarCaixa())
            throw new Error("Funcionário sem autorização para operar o caixa.");
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
    getIdResponsavelFechamento() { return this.idResponsavelFechamento; }
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
        return Number((this.valorInicial + this.vendas.reduce((soma, venda) => soma + venda.calcularDinheiroLiquido(), 0)).toFixed(2));
    }
    calcularSaldoConsolidado() {
        return Number((this.valorInicial + this.calcularTotalVendas()).toFixed(2));
    }
    calcularTotalDigital() {
        return Number(this.vendas.reduce((soma, venda) => soma + venda.calcularTotalDigital(), 0).toFixed(2));
    }
    getEsperadoNoFechamento() { return this.esperadoNoFechamento; }
    getValorConferido() { return this.valorConferido; }
    calcularDiferencaFechamento() {
        return this.valorConferido !== undefined && this.esperadoNoFechamento !== undefined
            ? Number((this.valorConferido - this.esperadoNoFechamento).toFixed(2)) : undefined;
    }
    fecharSessao(dataFechamento, valorFinalConferido, idResponsavel) {
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
    restaurarFechamento(dataFechamento, valorFinal, esperadoNoFechamento, valorConferido, idResponsavel) {
        this.dataFechamento = dataFechamento;
        this.valorFinal = valorFinal;
        this.esperadoNoFechamento = esperadoNoFechamento;
        this.valorConferido = valorConferido;
        this.idResponsavelFechamento = idResponsavel;
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
    constructor(idVenda, dataHoraVenda, sessaoCaixa, cliente, operadorVenda) {
        this.valorTotal = 0;
        this.itens = [];
        this.pagamentos = [];
        this.idVenda = idVenda;
        this.dataHoraVenda = dataHoraVenda;
        this.sessaoCaixa = sessaoCaixa;
        this.cliente = cliente;
        this.operadorVenda = operadorVenda ?? sessaoCaixa.getFuncionario();
        this.operadorRegistrado = operadorVenda !== undefined;
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
    getOperadorVenda() { return this.operadorVenda; }
    getIdOperadorRegistrado() { return this.operadorRegistrado ? this.operadorVenda.getIdFuncionario() : undefined; }
    getPagamentos() {
        return [...this.pagamentos];
    }
    adicionarItem(produto, qtdVenda, precoUnitario) {
        produto.exigirAtivo();
        if (produto.estaVencido())
            throw new Error(`Produto vencido: ${produto.getDescricaoProduto()}. Venda bloqueada.`);
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
        const diferenca = Math.max(0, Math.round(this.calcularTotalPago() * 100) - Math.round(this.valorTotal * 100));
        return Math.min(diferenca, Math.round(this.calcularTotalDinheiro() * 100)) / 100;
    }
    calcularTotalDinheiro() {
        return this.pagamentos.filter(p => p.getFormaPagamento().permiteTroco())
            .reduce((soma, p) => soma + Math.round(p.getValorPago() * 100), 0) / 100;
    }
    calcularTotalDigital() {
        return this.pagamentos.filter(p => !p.getFormaPagamento().permiteTroco())
            .reduce((soma, p) => soma + Math.round(p.getValorPago() * 100), 0) / 100;
    }
    calcularDinheiroLiquido() {
        return Number((this.calcularTotalDinheiro() - this.calcularTroco()).toFixed(2));
    }
    validarVendaParaFinalizacao() {
        if (!this.operadorVenda.podeOperarCaixa())
            throw new Error("Responsável da venda sem autorização para operar o caixa.");
        if (!this.operadorVenda.ehGerente() && this.operadorVenda.getIdFuncionario() !== this.sessaoCaixa.getFuncionario().getIdFuncionario())
            throw new Error("Sessão pertence a outro funcionário.");
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
            if (item.getProduto().estaVencido())
                throw new Error(`Produto vencido: ${item.getProduto().getDescricaoProduto()}. Venda bloqueada.`);
            if (item.getQtdVenda() > item.getProduto().getQtdEstoque())
                throw new Error("Estoque insuficiente na finalização da venda.");
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


// --- ControladorInterface.js ---

class ControladorInterface {
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
