export var StatusCaixa;
(function (StatusCaixa) {
    StatusCaixa["LIVRE"] = "LIVRE";
    StatusCaixa["OCUPADO"] = "OCUPADO";
    StatusCaixa["MANUTENCAO"] = "MANUTENCAO";
})(StatusCaixa || (StatusCaixa = {}));
export var TipoMovimentacao;
(function (TipoMovimentacao) {
    TipoMovimentacao["ENTRADA"] = "ENTRADA";
    TipoMovimentacao["SAIDA"] = "SAIDA";
    TipoMovimentacao["AJUSTE"] = "AJUSTE";
})(TipoMovimentacao || (TipoMovimentacao = {}));
export class Categoria {
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
export class Cargo {
    constructor(idCargo, nomeCargo, salarioBase) {
        if (!nomeCargo || nomeCargo.trim() === "") {
            throw new Error("O nome do cargo é obrigatório.");
        }
        if (salarioBase < 0) {
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
        if (salario < 0) {
            throw new Error("O salário base não pode ser negativo.");
        }
        this.salarioBase = salario;
    }
}
export class Funcionario {
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
export class Fornecedor {
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
export class Cliente {
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
export class FormaPagamento {
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
export class Caixa {
    constructor(idCaixa, numeroCaixa, statusCaixa = StatusCaixa.LIVRE) {
        if (numeroCaixa <= 0) {
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
