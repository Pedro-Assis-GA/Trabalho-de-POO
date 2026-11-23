export interface EntidadeIdentificavel<T = number> {
    getId(): T;
}

export interface ObservadorSistema {
    atualizar(evento: string, dados?: unknown): void;
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

export class Cargo implements EntidadeIdentificavel<number> {
    private idCargo: number;
    private nomeCargo: string;
    private salarioBase: number;

    constructor(idCargo: number, nomeCargo: string, salarioBase: number) {
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
        if (salario < 0) {
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

    constructor(
        idFuncionario: number,
        cpfFuncionario: string,
        nomeFuncionario: string,
        senha: string,
        dataAdmissao: string,
        cargo: Cargo,
        telefones: string[] = []
    ) {
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
        return this.senha === senhaInformada;
    }

    public getSenha(): string {
        return this.senha;
    }
}

export class Fornecedor implements EntidadeIdentificavel<number> {
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
        telefones: string[] = []
    ) {
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

    public getId(): number {
        return this.idFornecedor;
    }

    public getIdFornecedor(): number {
        return this.idFornecedor;
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
        cpfCliente: string
    ) {
        if (!nomeCliente || nomeCliente.trim() === "") {
            throw new Error("O nome do cliente é obrigatório.");
        }
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente.trim();
        this.telefoneCliente = telefoneCliente.trim();
        this.cpfCliente = cpfCliente.trim();
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
        if (numeroCaixa <= 0) {
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
