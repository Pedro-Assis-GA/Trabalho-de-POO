import { StatusCaixa, TipoMovimentacao } from "./modelos/Entidades.js";
import { GerenciadorSistema } from "./servicos/GerenciadorSistema.js";

function afirmar(condicao: boolean, mensagem: string): void {
    if (!condicao) {
        throw new Error(`[FALHA DE TESTE] ${mensagem}`);
    }
    console.log(`✅ PASSOU: ${mensagem}`);
}

function executarTestesDeFluxo(): void {
    console.log("==================================================");
    console.log("INICIANDO BATERIA DE TESTES POO - SISTEMA COMÉRCIO");
    console.log("==================================================\n");

    const sistema = new GerenciadorSistema(false);
    sistema.resetarDadosParaPadrao();

    // 1. Verificar dados iniciais e entidades
    afirmar(sistema.listarCategorias().length >= 4, "Categorias iniciais carregadas.");
    afirmar(sistema.listarCargos().length >= 3, "Cargos iniciais carregados.");
    afirmar(sistema.listarFuncionarios().length >= 3, "Funcionários iniciais (Matheus, Pietro, Victor) carregados.");
    afirmar(sistema.listarFornecedores().length >= 2, "Fornecedores iniciais carregados.");
    afirmar(sistema.listarProdutos().length >= 5, "Produtos iniciais carregados.");
    afirmar(sistema.listarFormasPagamento().length === 4, "Formas de pagamento carregadas.");

    // 2. Testar cadastro de nova categoria, fornecedor e produto
    const novaCat = sistema.cadastrarCategoria("Padaria e Confeitaria");
    const novoForn = sistema.cadastrarFornecedor(
        "55.444.333/0001-22",
        "Moinho Trigo Bom Ltda",
        "contato@trigobom.com.br",
        ["(19) 3211-0099"]
    );
    const pao = sistema.cadastrarProduto(
        "7891000500999",
        "Pão de Forma Tradicional 500g",
        7.5,
        4.2,
        "UN",
        10,
        5,
        novaCat.getIdCategoria(),
        "2027-12-31",
        [novoForn.getIdFornecedor()],
        1
    );
    afirmar(pao.getQtdEstoque() === 10, "Produto cadastrado com estoque inicial de 10 unidades.");
    afirmar(!pao.abaixoDoEstoqueMinimo(), "Produto com 10 unidades não está abaixo do mínimo (5).");

    // 3. Testar Compra de Fornecedor e abastecimento automático
    const compra = sistema.registrarCompra(novoForn.getIdFornecedor(), 3, [
        { codigoBarras: "7891000500999", qtdCompra: 15, custoUnitario: 4.5 }
    ]);
    afirmar(compra.getValorTotal() === 67.5, "Valor total da compra calculado corretamente (15 * 4.50 = 67.50).");
    afirmar(pao.getQtdEstoque() === 25, "Estoque do produto atualizado automaticamente após compra (10 + 15 = 25).");
    afirmar(pao.getCustoProduto() === 4.5, "Custo do produto atualizado para o último custo de compra (R$ 4,50).");

    // 4. Testar Venda com múltiplas formas de pagamento (Paga_Com) e Cliente identificado
    const sessaoAtiva = sistema.obterSessaoAbertaAtual();
    afirmar(sessaoAtiva !== undefined, "Existe uma sessão de caixa aberta.");

    const venda = sistema.registrarVenda(
        sessaoAtiva!.getIdSessao(),
        [{ codigoBarras: "7891000500999", qtdVenda: 4 }],
        [
            { idForma: 1, valorPago: 15.0 },
            { idForma: 2, valorPago: 15.0 }
        ],
        1
    );
    afirmar(venda.getValorTotal() === 30.0, "Valor total da venda calculado corretamente (4 * 7.50 = 30.00).");
    afirmar(venda.getPagamentos().length === 2, "Venda registrada com 2 formas de pagamento (Dinheiro + PIX).");
    afirmar(pao.getQtdEstoque() === 21, "Estoque baixado automaticamente após venda (25 - 4 = 21).");

    // 5. Testar validação de erro ao vender mais que o estoque disponível
    let bloqueouEstoqueInsuficiente = false;
    try {
        sistema.registrarVenda(
            sessaoAtiva!.getIdSessao(),
            [{ codigoBarras: "7891000500999", qtdVenda: 999 }],
            [{ idForma: 1, valorPago: 9999.0 }]
        );
    } catch {
        bloqueouEstoqueInsuficiente = true;
    }
    afirmar(bloqueouEstoqueInsuficiente, "Sistema bloqueou venda com quantidade acima do estoque disponível.");

    // 6. Testar validação de erro ao pagar valor menor que o total da venda
    let bloqueouPagamentoInsuficiente = false;
    try {
        sistema.registrarVenda(
            sessaoAtiva!.getIdSessao(),
            [{ codigoBarras: "7891000500999", qtdVenda: 2 }],
            [{ idForma: 1, valorPago: 5.0 }]
        );
    } catch {
        bloqueouPagamentoInsuficiente = true;
    }
    afirmar(bloqueouPagamentoInsuficiente, "Sistema bloqueou venda com pagamento inferior ao valor total.");

    // 7. Testar Fechamento de Sessão de Caixa e status do Caixa
    const saldoEsperado = sessaoAtiva!.calcularSaldoEsperado();
    sistema.fecharSessaoCaixa(sessaoAtiva!.getIdSessao());
    afirmar(!sessaoAtiva!.estaAberta(), "Sessão de caixa foi encerrada com sucesso.");
    afirmar(
        sessaoAtiva!.getValorFinal() === saldoEsperado,
        `Valor final da sessão conferido corretamente (R$ ${saldoEsperado.toFixed(2)}).`
    );
    afirmar(
        sessaoAtiva!.getCaixa().getStatusCaixa() === StatusCaixa.LIVRE,
        "Caixa voltou para o status LIVRE após fechamento da sessão."
    );

    // 8. Testar Ajuste de Estoque e Rastreabilidade do Funcionário
    sistema.realizarAjusteEstoque("7891000500999", TipoMovimentacao.SAIDA, 1, 3);
    afirmar(pao.getQtdEstoque() === 20, "Saída manual de estoque reduziu quantidade para 20.");

    const rastreioVictor = sistema.obterRastreabilidadeFuncionario(3);
    afirmar(
        rastreioVictor.comprasRegistradas.length >= 2 && rastreioVictor.movimentacoesEstoque.length >= 2,
        "Rastreabilidade do funcionário Victor Canassa retornou todas as compras e movimentações realizadas."
    );

    console.log("\n==================================================");
    console.log("🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! 🎉");
    console.log("==================================================");
}

executarTestesDeFluxo();
