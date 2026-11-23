import test from 'node:test';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { TipoMovimentacao, StatusCaixa } from '../dist/modelos/Entidades.js';

function memoryStorage() {
    const data = new Map();
    return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) };
}
function sistema() {
    Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true });
    return new GerenciadorSistema();
}
const codigo = '7891000100101';

test('compra inválida no segundo item não altera estoque, custo, compras ou movimentos', () => {
    const s = sistema();
    const p = s.buscarProdutoPorCodigo(codigo);
    const antes = [p.getQtdEstoque(), p.getCustoProduto(), s.listarCompras().length, s.listarMovimentacoesEstoque().length];
    for (const segundo of [
        { codigoBarras: 'INEXISTENTE', qtdCompra: 1, custoUnitario: 2 },
        { codigoBarras: codigo, qtdCompra: 1, custoUnitario: -2 },
        { codigoBarras: codigo, qtdCompra: NaN, custoUnitario: 2 }
    ]) {
        assert.throws(() => s.registrarCompra(1, 3, [{ codigoBarras: codigo, qtdCompra: 2, custoUnitario: 99 }, segundo]));
        assert.deepEqual([p.getQtdEstoque(), p.getCustoProduto(), s.listarCompras().length, s.listarMovimentacoesEstoque().length], antes);
    }
});

test('ajustes rejeitam NaN, infinito, negativos e tipo inexistente sem mutação', () => {
    const s = sistema();
    const estoque = s.buscarProdutoPorCodigo(codigo).getQtdEstoque();
    const movs = s.listarMovimentacoesEstoque().length;
    for (const valor of [NaN, Infinity, -Infinity, -1]) {
        for (const tipo of Object.values(TipoMovimentacao)) assert.throws(() => s.realizarAjusteEstoque(codigo, tipo, valor, 3));
    }
    assert.throws(() => s.realizarAjusteEstoque(codigo, 'INVENTADO', 2, 3));
    assert.equal(s.buscarProdutoPorCodigo(codigo).getQtdEstoque(), estoque);
    assert.equal(s.listarMovimentacoesEstoque().length, movs);
});

test('ajuste absoluto para zero mantém quantidade real zero na rastreabilidade', () => {
    const s = sistema();
    const mov = s.realizarAjusteEstoque(codigo, TipoMovimentacao.AJUSTE, 0, 3);
    assert.equal(s.buscarProdutoPorCodigo(codigo).getQtdEstoque(), 0);
    assert.equal(mov.getQtdMovimentacao(), 0);
    const restaurado = new GerenciadorSistema();
    assert.equal(restaurado.listarMovimentacoesEstoque()[0].getQtdMovimentacao(), 0);
});

test('fechar/reabrir o mesmo caixa preserva OCUPADO após restauração e bloqueia abertura duplicada', () => {
    const s = sistema();
    s.fecharSessaoCaixa(s.obterSessaoAbertaAtual().getIdSessao());
    const sessao = s.abrirSessaoCaixa(1, 2, 100);
    const restaurado = new GerenciadorSistema();
    assert.equal(restaurado.buscarCaixaPorId(1).getStatusCaixa(), StatusCaixa.OCUPADO);
    assert.equal(restaurado.obterSessaoAbertaAtual().getIdSessao(), sessao.getIdSessao());
    assert.throws(() => restaurado.abrirSessaoCaixa(1, 2, 100));
});

test('estado com referência inválida retorna à demonstração sem duplicar entidades', () => {
    const s = sistema();
    const key = 'sistema_comercio_poo_v1';
    const data = JSON.parse(localStorage.getItem(key));
    data.produtos[0].idCategoria = 999;
    localStorage.setItem(key, JSON.stringify(data));
    const novo = new GerenciadorSistema();
    assert.equal(novo.listarCategorias().length, s.listarCategorias().length);
    assert.equal(novo.listarFuncionarios().length, s.listarFuncionarios().length);
    assert.equal(novo.listarFornecedores().length, s.listarFornecedores().length);
    assert.equal(novo.listarVendas().length, 1);
});

test('operador escolhido e operações de compra/venda sobrevivem à restauração', () => {
    const s = sistema();
    s.definirFuncionarioAtivo(3);
    s.registrarCompra(1, 3, [{ codigoBarras: codigo, qtdCompra: 3, custoUnitario: 21 }]);
    s.registrarVenda(s.obterSessaoAbertaAtual().getIdSessao(), [{ codigoBarras: codigo, qtdVenda: 1 }], [{ idForma: 2, valorPago: 28.90 }]);
    const estoque = s.buscarProdutoPorCodigo(codigo).getQtdEstoque();
    const novo = new GerenciadorSistema();
    assert.equal(novo.getFuncionarioLogado().getIdFuncionario(), 3);
    assert.equal(novo.buscarProdutoPorCodigo(codigo).getQtdEstoque(), estoque);
    assert.equal(novo.listarCompras().length, 2);
    assert.equal(novo.listarVendas().length, 2);
    assert.equal(novo.listarVendas()[0].getPagamentos()[0].getValorPago(), 28.90);
});

test('fechamento inválido não encerra sessão nem libera caixa', () => {
    const s = sistema();
    const sessao = s.obterSessaoAbertaAtual();
    for (const valor of [-1, NaN, Infinity]) assert.throws(() => s.fecharSessaoCaixa(sessao.getIdSessao(), valor));
    assert.equal(sessao.estaAberta(), true);
    assert.equal(sessao.getCaixa().getStatusCaixa(), StatusCaixa.OCUPADO);
});

test('venda com pagamento ou quantidade inválidos não baixa estoque', () => {
    const s = sistema();
    const id = s.obterSessaoAbertaAtual().getIdSessao();
    const estoque = s.buscarProdutoPorCodigo(codigo).getQtdEstoque();
    const vendas = s.listarVendas().length;
    for (const valor of [NaN, Infinity, -1, 0]) {
        assert.throws(() => s.registrarVenda(id, [{ codigoBarras: codigo, qtdVenda: valor }], [{ idForma: 1, valorPago: 100 }]));
        assert.throws(() => s.registrarVenda(id, [{ codigoBarras: codigo, qtdVenda: 1 }], [{ idForma: 1, valorPago: valor }]));
    }
    assert.throws(() => s.registrarVenda(id, [{ codigoBarras: codigo, qtdVenda: 1 }], [{ idForma: 1, valorPago: 1 }]));
    assert.equal(s.buscarProdutoPorCodigo(codigo).getQtdEstoque(), estoque);
    assert.equal(s.listarVendas().length, vendas);
});
