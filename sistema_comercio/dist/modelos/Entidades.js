/** Validações do domínio para novos cadastros. Não confirma titularidade do documento. */
export class Documento {
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
export var ModuloSistema;
(function (ModuloSistema) {
    ModuloSistema["CAIXA"] = "CAIXA";
    ModuloSistema["ESTOQUE"] = "ESTOQUE";
    ModuloSistema["COMPRAS"] = "COMPRAS";
    ModuloSistema["EQUIPE"] = "EQUIPE";
})(ModuloSistema || (ModuloSistema = {}));
export class Cargo {
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
export class Funcionario {
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
export class Fornecedor {
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
export class Cliente {
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
export class FormaPagamento {
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
export class Caixa {
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
