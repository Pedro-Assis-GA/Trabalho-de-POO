export interface EntidadeIdentificavel<T = number> {
    getId(): T;
}

export interface ObservadorSistema {
    atualizar(evento: string, dados?: unknown): void;
}

/** Validações do domínio para novos cadastros. Não confirma titularidade do documento. */
export class Documento {
    public static normalizar(valor: string): string {
        return valor.trim().replace(/[.\-\/\s]/g, "");
    }

    public static validarCPF(valor: string): string {
        const cpf = Documento.normalizar(valor);
        if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) throw new Error("CPF inválido.");
        for (let tamanho = 9; tamanho <= 10; tamanho++) {
            let soma = 0;
            for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
            const resto = (soma * 10) % 11;
            if ((resto === 10 ? 0 : resto) !== Number(cpf[tamanho])) throw new Error("CPF inválido.");
        }
        return cpf;
    }

    public static validarCNPJ(valor: string): string {
        const cnpj = Documento.normalizar(valor);
        if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj)) throw new Error("CNPJ numérico inválido.");
        for (let tamanho = 12; tamanho <= 13; tamanho++) {
            let peso = tamanho - 7, soma = 0;
            for (let i = 0; i < tamanho; i++) {
                soma += Number(cnpj[i]) * peso--;
                if (peso === 1) peso = 9;
            }
            const resto = soma % 11;
            if ((resto < 2 ? 0 : 11 - resto) !== Number(cnpj[tamanho])) throw new Error("CNPJ numérico inválido.");
        }
        return cnpj;
    }

    public static validarDataISO(valor: string): string {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || !Number.isFinite(Date.parse(valor + "T00:00:00Z")) ||
            new Date(valor + "T00:00:00Z").toISOString().slice(0, 10) !== valor) {
            throw new Error("Data inválida. Use uma data real no formato AAAA-MM-DD.");
        }
        return valor;
    }
}

export enum StatusCaixa {
    LIVRE = "LIVRE",
    OCUPADO = "OCUPADO",
    MANUTENCAO = "MANUTENCAO"
}

export enum TipoMovimentacao {
    ENTRADA = "ENTRADA",
    SAIDA = "SAIDA",
    AJUSTE = "AJUSTE"
}

export class Categoria implements EntidadeIdentificavel<number> {
    private idCategoria: number;
    private nomeCategoria: string;

    constructor(idCategoria: number, nomeCategoria: string) {
        if (!nomeCategoria || nomeCategoria.trim() === "") {
            throw new Error("O nome da categoria não pode ser vazio.");
        }
        this.idCategoria = idCategoria;
        this.nomeCategoria = nomeCategoria.trim();
    }

    public getId(): number {
        return this.idCategoria;
    }

    public getIdCategoria(): number {
        return this.idCategoria;
    }

    public getNomeCategoria(): string {
        return this.nomeCategoria;
    }

    public setNomeCategoria(novoNome: string): void {
        if (!novoNome || novoNome.trim() === "") {
            throw new Error("O nome da categoria não pode ser vazio.");
        }
        this.nomeCategoria = novoNome.trim();
    }
}

export enum ModuloSistema {
    CAIXA = "CAIXA",
    ESTOQUE = "ESTOQUE",
    COMPRAS = "COMPRAS",
    EQUIPE = "EQUIPE"
}

export class Cargo implements EntidadeIdentificavel<number> {
    private idCargo: number;
    private nomeCargo: string;
    private salarioBase: number;
    private permissoes: ModuloSistema[];

    constructor(idCargo: number, nomeCargo: string, salarioBase: number, permissoes: ModuloSistema[] = []) {
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

    public static validarModulo(modulo: ModuloSistema): ModuloSistema {
        if (!Object.values(ModuloSistema).includes(modulo)) throw new Error("Módulo de autorização inválido.");
        return modulo;
    }

    public static validarPermissoes(permissoes: ModuloSistema[]): ModuloSistema[] {
        if (!Array.isArray(permissoes)) throw new Error("Lista de permissões inválida.");
        return [...new Set(permissoes.map(p => Cargo.validarModulo(p)))];
    }

    public static permissoesLegadas(nome: string): ModuloSistema[] {
        const normalizado = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
        if (normalizado === "operador de caixa") return [ModuloSistema.CAIXA];
        if (/^gerente(?: |$)/.test(normalizado)) return [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS, ModuloSistema.EQUIPE];
        if (normalizado === "auxiliar de estoque") return [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS];
        return [];
    }

    public getPermissoes(): ModuloSistema[] { return [...this.permissoes]; }
    public permite(modulo: ModuloSistema): boolean { return this.permissoes.includes(Cargo.validarModulo(modulo)); }

    public getId(): number {
        return this.idCargo;
    }

    public getIdCargo(): number {
        return this.idCargo;
    }

    public getNomeCargo(): string {
        return this.nomeCargo;
    }

    public setNomeCargo(nome: string): void {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do cargo não pode ser vazio.");
        }
        this.nomeCargo = nome.trim();
    }

    public getSalarioBase(): number {
        return this.salarioBase;
    }

    public setSalarioBase(salario: number): void {
        if ((!Number.isFinite(salario) || salario < 0)) {
            throw new Error("O salário base não pode ser negativo.");
        }
        this.salarioBase = salario;
    }
}

export class Funcionario implements EntidadeIdentificavel<number> {
    private idFuncionario: number;
    private cpfFuncionario: string;
    private nomeFuncionario: string;
    private senha: string;
    private dataAdmissao: string;
    private cargo: Cargo;
    private telefones: string[] = [];
    private autorizacoesIndividuais: ModuloSistema[];

    constructor(
        idFuncionario: number,
        cpfFuncionario: string,
        nomeFuncionario: string,
        senha: string,
        dataAdmissao: string,
        cargo: Cargo,
        telefones: string[] = [],
        origem: "novo" | "historico" = "novo",
        autorizadoNoCaixa: boolean = false,
        autorizacoesIndividuais?: ModuloSistema[]
    ) {
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
        if (typeof autorizadoNoCaixa !== "boolean") throw new Error("Autorização de caixa inválida.");
        this.autorizacoesIndividuais = Cargo.validarPermissoes(autorizacoesIndividuais !== undefined ? autorizacoesIndividuais : (autorizadoNoCaixa ? [ModuloSistema.CAIXA] : []));
        telefones.forEach((t) => this.adicionarTelefone(t));
    }

    public getId(): number {
        return this.idFuncionario;
    }

    public getIdFuncionario(): number {
        return this.idFuncionario;
    }

    public getCpfFuncionario(): string {
        return this.cpfFuncionario;
    }

    public getNomeFuncionario(): string {
        return this.nomeFuncionario;
    }

    public getDataAdmissao(): string {
        return this.dataAdmissao;
    }

    public getCargo(): Cargo {
        return this.cargo;
    }

    public setCargo(novoCargo: Cargo): void {
        this.cargo = novoCargo;
    }

    private nomeCargoNormalizado(): string {
        return this.cargo.getNomeCargo().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    public ehOperadorDeCaixa(): boolean { return this.cargo.permite(ModuloSistema.CAIXA); }
    public ehGerente(): boolean { return /^gerente(?: |$)/.test(this.nomeCargoNormalizado()); }
    public getAutorizacoesIndividuais(): ModuloSistema[] { return [...this.autorizacoesIndividuais]; }
    public temAutorizacaoModulo(modulo: ModuloSistema): boolean { return this.autorizacoesIndividuais.includes(Cargo.validarModulo(modulo)); }
    public temAcessoModulo(modulo: ModuloSistema): boolean { Cargo.validarModulo(modulo); return this.ehGerente() || this.cargo.permite(modulo) || this.temAutorizacaoModulo(modulo); }
    public temAutorizacaoCaixa(): boolean { return this.temAutorizacaoModulo(ModuloSistema.CAIXA); }
    public podeOperarCaixa(): boolean { return this.temAcessoModulo(ModuloSistema.CAIXA); }

    public alterarAutorizacaoCaixa(permitir: boolean, responsavel: Funcionario): void {
        this.alterarAutorizacaoModulo(ModuloSistema.CAIXA, permitir, responsavel);
    }

    public alterarAutorizacaoModulo(modulo: ModuloSistema, permitir: boolean, responsavel: Funcionario): void {
        Cargo.validarModulo(modulo);
        if (!responsavel.ehGerente()) throw new Error("Somente um gerente pode conceder ou revogar autorizações.");
        if (typeof permitir !== "boolean") throw new Error("Autorização inválida.");
        if (this.ehGerente()) throw new Error("Gerente já possui acesso a todos os módulos.");
        if (this.cargo.permite(modulo)) throw new Error("Permissão já habilitada pelo cargo; autorizações individuais são complementares.");
        if (permitir === this.temAutorizacaoModulo(modulo)) throw new Error("A autorização já está nesse estado.");
        this.autorizacoesIndividuais = permitir ? [...this.autorizacoesIndividuais, modulo] : this.autorizacoesIndividuais.filter(p => p !== modulo);
    }

    public getTelefones(): string[] {
        return [...this.telefones];
    }

    public adicionarTelefone(telefone: string): void {
        const limpo = telefone.trim();
        if (limpo && !this.telefones.includes(limpo)) {
            this.telefones.push(limpo);
        }
    }

    public removerTelefone(telefone: string): void {
        this.telefones = this.telefones.filter((t) => t !== telefone);
    }

    public autenticar(senhaInformada: string): boolean {
        return this.senha !== "" && this.senha === senhaInformada;
    }

    public getSenha(): string {
        return this.senha;
    }
}

export class Fornecedor implements EntidadeIdentificavel<number> {
    private ativo: boolean;
    private idFornecedor: number;
    private cnpj: string;
    private razaoSocial: string;
    private email: string;
    private telefones: string[] = [];

    constructor(
        idFornecedor: number,
        cnpj: string,
        razaoSocial: string,
        email: string,
        telefones: string[] = [],
        origem: "novo" | "historico" = "novo",
        ativo: boolean = true
    ) {
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
        if (typeof ativo !== "boolean") throw new Error("Situação do fornecedor inválida.");
        this.ativo = ativo;
        telefones.forEach((t) => this.adicionarTelefone(t));
    }

    public getId(): number {
        return this.idFornecedor;
    }

    public getIdFornecedor(): number {
        return this.idFornecedor;
    }

    public estaAtivo(): boolean { return this.ativo; }
    public inativar(): void {
        if (!this.ativo) throw new Error("Fornecedor já removido.");
        this.ativo = false;
    }

    public getCnpj(): string {
        return this.cnpj;
    }

    public getRazaoSocial(): string {
        return this.razaoSocial;
    }

    public getEmail(): string {
        return this.email;
    }

    public getTelefones(): string[] {
        return [...this.telefones];
    }

    public adicionarTelefone(telefone: string): void {
        const limpo = telefone.trim();
        if (limpo && !this.telefones.includes(limpo)) {
            this.telefones.push(limpo);
        }
    }
}

export class Cliente implements EntidadeIdentificavel<number> {
    private idCliente: number;
    private nomeCliente: string;
    private telefoneCliente: string;
    private cpfCliente: string;

    constructor(
        idCliente: number,
        nomeCliente: string,
        telefoneCliente: string,
        cpfCliente: string,
        origem: "novo" | "historico" = "novo"
    ) {
        if (!nomeCliente || nomeCliente.trim() === "") {
            throw new Error("O nome do cliente é obrigatório.");
        }
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente.trim();
        this.telefoneCliente = telefoneCliente.trim();
        this.cpfCliente = origem === "historico" ? cpfCliente.trim() : Documento.validarCPF(cpfCliente);
    }

    public getId(): number {
        return this.idCliente;
    }

    public getIdCliente(): number {
        return this.idCliente;
    }

    public getNomeCliente(): string {
        return this.nomeCliente;
    }

    public getTelefoneCliente(): string {
        return this.telefoneCliente;
    }

    public getCpfCliente(): string {
        return this.cpfCliente;
    }
}

export class FormaPagamento implements EntidadeIdentificavel<number> {
    public permiteTroco(): boolean {
        return this.descricao.trim().toLocaleLowerCase("pt-BR") === "dinheiro";
    }
    private idForma: number;
    private descricao: string;

    constructor(idForma: number, descricao: string) {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A descrição da forma de pagamento é obrigatória.");
        }
        this.idForma = idForma;
        this.descricao = descricao.trim();
    }

    public getId(): number {
        return this.idForma;
    }

    public getIdForma(): number {
        return this.idForma;
    }

    public getDescricao(): string {
        return this.descricao;
    }
}

export class Caixa implements EntidadeIdentificavel<number> {
    private idCaixa: number;
    private numeroCaixa: number;
    private statusCaixa: StatusCaixa;

    constructor(
        idCaixa: number,
        numeroCaixa: number,
        statusCaixa: StatusCaixa = StatusCaixa.LIVRE
    ) {
        if ((!Number.isInteger(numeroCaixa) || numeroCaixa <= 0)) {
            throw new Error("O número do caixa deve ser maior que zero.");
        }
        this.idCaixa = idCaixa;
        this.numeroCaixa = numeroCaixa;
        this.statusCaixa = statusCaixa;
    }

    public getId(): number {
        return this.idCaixa;
    }

    public getIdCaixa(): number {
        return this.idCaixa;
    }

    public getNumeroCaixa(): number {
        return this.numeroCaixa;
    }

    public getStatusCaixa(): StatusCaixa {
        return this.statusCaixa;
    }

    public setStatusCaixa(novoStatus: StatusCaixa): void {
        this.statusCaixa = novoStatus;
    }
}
