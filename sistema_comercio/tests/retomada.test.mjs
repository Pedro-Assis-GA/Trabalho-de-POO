import test from 'node:test';
import { prepararOperadorCompleto } from './apoio-permissoes.mjs';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';

function ambiente(popular = true) {
    const dados = new Map();
    const storage = {
        getItem: k => dados.get(k) ?? null, setItem: (k,v) => dados.set(k,String(v))
    };
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    return { s: prepararOperadorCompleto(new GerenciadorSistema(popular)), dados, storage };
}
const chave = 'sistema_comercio_poo_v1';

test('cadastro com responsável inválido não deixa produto, movimento ou JSON parcial', () => {
    const {s,dados} = ambiente();
    const salvo = dados.get(chave), total = s.listarProdutos().length, movimentos = s.listarMovimentacoesEstoque().length;
    for (const estoque of [3,0]) for (const responsavel of [999,0]) {
        assert.throws(() => s.cadastrarProduto('QA-RESP', 'Teste', 5, 2, 'UN', estoque, 1, 1, undefined, [], responsavel), /Funcionário/);
        assert.equal(s.listarProdutos().length, total);
        assert.equal(s.listarMovimentacoesEstoque().length, movimentos);
        assert.equal(dados.get(chave), salvo);
    }
    s.cadastrarProduto('QA-RESP', 'Teste válido', 5, 2, 'UN', 3, 1, 1, undefined, [], 1);
    assert.equal(s.listarProdutos().length, total + 1);
    assert.equal(s.listarMovimentacoesEstoque().length, movimentos + 1);
    assert.equal(s.listarMovimentacoesEstoque()[0].getFuncionarioResponsavel().getIdFuncionario(), 1);
});

test('estoque inicial positivo exige responsável, cadastro sem estoque continua permitido', () => {
    const {s,dados} = ambiente(false);
    s.cadastrarCategoria('Teste');const salvo = dados.get(chave);
    assert.throws(() => s.cadastrarProduto('QA-SEM-RESP', 'Teste', 5, 2, 'UN', 3, 1, 1), /funcionário/i);
    assert.equal(s.listarProdutos().length, 0);assert.equal(dados.get(chave), salvo);
    s.cadastrarProduto('QA-ZERO', 'Teste vazio', 5, 2, 'UN', 0, 1, 1);
    assert.equal(s.listarProdutos().length, 1);
});

test('aba em recuperação não sobrescreve dados já recuperados por outra aba', () => {
    const {dados} = ambiente();dados.set(chave, '{INVALIDO');
    const a = new GerenciadorSistema(), b = new GerenciadorSistema();
    b.resetarDadosParaPadrao();b.definirFuncionarioAtivo(1);b.cadastrarCategoria('Recuperado por B');
    const salvo = dados.get(chave), chaves = [...dados.keys()], categoriasA = a.listarCategorias().length;
    assert.throws(() => a.resetarDadosParaPadrao(), /Conflito/);
    assert.match(a.getAvisoPersistencia(), /outra aba/);
    assert.equal(dados.get(chave), salvo);assert.deepEqual([...dados.keys()], chaves);
    assert.equal(a.listarCategorias().length, categoriasA);
    const c = new GerenciadorSistema();
    assert.ok(c.listarCategorias().some(cat => cat.getNomeCategoria() === 'Recuperado por B'));
});

test('falha de leitura impede escrita de snapshot antigo e permite retomar após leitura confiável', () => {
    const {s:a,dados,storage} = ambiente();
    const b = new GerenciadorSistema();b.cadastrarCategoria('Outra aba');const salvo = dados.get(chave);
    const getter = storage.getItem;storage.getItem = () => { throw new Error('Leitura indisponível'); };
    assert.throws(() => a.cadastrarCategoria('Snapshot antigo'), /conferir|armazenamento/i);
    assert.equal(a.listarCategorias().length,4);assert.equal(dados.get(chave),salvo);assert.ok(a.getAvisoPersistencia());
    storage.getItem = getter;
    assert.throws(() => a.cadastrarCategoria('Ainda antigo'), /Conflito/);
    assert.equal(dados.get(chave),salvo);
    const c = new GerenciadorSistema();c.cadastrarCategoria('Depois de recarregar');
    assert.ok(new GerenciadorSistema().listarCategorias().some(cat => cat.getNomeCategoria() === 'Outra aba'));

    const limpo = ambiente();const read = limpo.storage.getItem;const inicial = limpo.dados.get(chave);
    limpo.storage.getItem = () => { throw new Error('Leitura temporária'); };
    assert.throws(() => limpo.s.cadastrarCategoria('Não aplicada'), /conferir|armazenamento/i);
    assert.equal(limpo.dados.get(chave),inicial);
    limpo.storage.getItem = read;limpo.s.cadastrarCategoria('Aplicada após recuperação');
    assert.equal(limpo.s.getAvisoPersistencia(),null);
    assert.equal(new GerenciadorSistema().listarCategorias().length,5);
});
