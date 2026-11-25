import test from 'node:test';
import { prepararOperadorCompleto } from './apoio-permissoes.mjs';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { ControladorInterface } from '../dist/ui/ControladorInterface.js';
import { Venda } from '../dist/modelos/CaixaEVendas.js';
import { TipoMovimentacao } from '../dist/modelos/Entidades.js';

const chave = 'sistema_comercio_poo_v1', codigo = '7891000200404';
function iniciar() {
    delete globalThis.document;
    const dados = new Map();
    const storage = { getItem: k => dados.get(k) ?? null, setItem: (k,v) => dados.set(k,String(v)) };
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage});
    const s = prepararOperadorCompleto(new GerenciadorSistema());
    // Datas determinísticas, independentes do vencimento da demonstração.
    s.corrigirValidadeProduto(codigo,'2000-01-01','Preparar vencimento para teste',1);
    return {s,dados,storage,p:s.buscarProdutoPorCodigo(codigo)};
}

test('datas, motivos, produto e operador inválidos não deixam correção parcial', () => {
    const {s,p,dados} = iniciar();
    const salvo = dados.get(chave), historico = s.listarCorrecoesValidade();
    for (const data of ['', '2026-02-30', '01/12/2030', '2000-01-01'])
        assert.throws(() => s.corrigirValidadeProduto(codigo,data,'Conferida embalagem',1));
    for (const motivo of ['', '    ', 'abc', 'a'.repeat(501)])
        assert.throws(() => s.corrigirValidadeProduto(codigo,'2099-12-31',motivo,1), /motivo/);
    assert.throws(() => p.corrigirDataValidade('2026-02-30','Data conferida'), /Data/);
    assert.throws(() => p.corrigirDataValidade('2099-12-31',''), /motivo/);
    for (const operador of [0,999,NaN]) assert.throws(() => s.corrigirValidadeProduto(codigo,'2099-12-31','Data conferida',operador), /Funcionário/);
    assert.throws(() => s.corrigirValidadeProduto('inexistente','2099-12-31','Data conferida',1));
    assert.equal(p.getDataValidade(),'2000-01-01');
    assert.deepEqual(s.listarCorrecoesValidade(),historico);
    assert.equal(dados.get(chave),salvo);
});

test('correção explícita preserva estoque, preços, movimentos e vendas; histórico é snapshot', () => {
    const {s,p} = iniciar();
    const antes = [p.getQtdEstoque(),p.getPrecoVenda(),p.getCustoProduto(),s.listarMovimentacoesEstoque().length,s.listarVendas().length];
    const registro = s.corrigirValidadeProduto(codigo,'2099-12-31','  Conferida na embalagem  ',2);
    assert.equal(registro.validadeAnterior,'2000-01-01');assert.equal(registro.novaValidade,'2099-12-31');
    assert.equal(registro.motivo,'Conferida na embalagem');assert.equal(registro.idFuncionario,2);
    assert.equal(registro.nomeFuncionario,s.buscarFuncionarioPorId(2).getNomeFuncionario());
    assert.ok(Number.isFinite(Date.parse(registro.dataHora)));
    registro.motivo = 'Adulterado';s.listarCorrecoesValidade()[0].novaValidade = '2000-01-01';
    p.setDescricaoProduto('Nome posterior');
    s.corrigirValidadeProduto(codigo,'2099-12-30','Segunda conferência',1);
    assert.equal(s.listarCorrecoesValidade()[1].motivo,'Conferida na embalagem');
    assert.notEqual(s.listarCorrecoesValidade()[1].descricaoProduto,'Nome posterior');
    assert.equal(s.listarCorrecoesValidade()[1].novaValidade,'2099-12-31');
    assert.equal(s.listarCorrecoesValidade()[0].validadeAnterior,'2099-12-31');
    assert.equal(s.listarCorrecoesValidade()[0].id,registro.id+1);
    assert.deepEqual([p.getQtdEstoque(),p.getPrecoVenda(),p.getCustoProduto(),s.listarMovimentacoesEstoque().length,s.listarVendas().length],antes);
});

test('histórico recarrega e dados legados sem campo preservam vendas', () => {
    const {s,dados} = iniciar();
    s.corrigirValidadeProduto(codigo,'2099-12-31','Conferida embalagem',1);
    const novo = new GerenciadorSistema();
    assert.deepEqual(novo.listarCorrecoesValidade(),s.listarCorrecoesValidade());
    assert.equal(novo.buscarProdutoPorCodigo(codigo).getDataValidade(),'2099-12-31');
    const legado = JSON.parse(dados.get(chave));delete legado.correcoesValidade;
    dados.set(chave,JSON.stringify(legado));
    const antigo = new GerenciadorSistema();assert.deepEqual(antigo.listarCorrecoesValidade(),[]);
    assert.equal(antigo.listarVendas().length,s.listarVendas().length);assert.equal(antigo.getAvisoPersistencia(),null);
    antigo.resetarDadosParaPadrao();assert.deepEqual(antigo.listarCorrecoesValidade(),[]);
});

test('vencimento permanece bloqueado; correção futura permite venda; carrinho é revalidado', () => {
    const {s,p} = iniciar(), sessao = s.obterSessaoAbertaAtual();
    const venda = new Venda(900,'Teste',sessao);
    assert.throws(() => venda.adicionarItem(p,1), /vencid/i);
    s.corrigirValidadeProduto(codigo,'2001-01-01','Conferência continua vencido',1);
    assert.throws(() => venda.adicionarItem(p,1), /vencid/i);
    s.corrigirValidadeProduto(codigo,'2099-12-31','Conferida data futura',1);
    venda.adicionarItem(p,1);venda.adicionarPagamento(s.buscarFormaPagamentoPorId(1),p.getPrecoVenda());
    s.corrigirValidadeProduto(codigo,'2000-01-01','Erro encontrado no carrinho',1);
    assert.throws(() => venda.validarVendaParaFinalizacao(), /vencid/i);
    s.corrigirValidadeProduto(codigo,'2099-12-31','Conferida finalmente na embalagem',1);
    const antes = p.getQtdEstoque();
    s.registrarVenda(sessao.getIdSessao(),[{codigoBarras:codigo,qtdVenda:1}],[{idForma:1,valorPago:p.getPrecoVenda()}]);
    assert.equal(p.getQtdEstoque(),antes-1);
});

test('baixa de vencido reduz estoque e registra SAIDA sem alterar validade', () => {
    const {s,p} = iniciar(), historico = s.listarCorrecoesValidade();
    const mov = s.realizarAjusteEstoque(codigo,TipoMovimentacao.SAIDA,p.getQtdEstoque(),1);
    assert.equal(p.getQtdEstoque(),0);assert.equal(p.getDataValidade(),'2000-01-01');
    assert.equal(mov.getTipo(),TipoMovimentacao.SAIDA);assert.deepEqual(s.listarCorrecoesValidade(),historico);
    assert.ok(!s.listarProdutosVencidos().includes(p));
    s.realizarAjusteEstoque(codigo,TipoMovimentacao.ENTRADA,1,1);
    assert.ok(s.listarProdutosVencidos().includes(p));assert.equal(p.getDataValidade(),'2000-01-01');
});

test('correção obedece bloqueios de concorrência/leitura e aviso de falha de gravação', () => {
    const {s,p,dados,storage} = iniciar();
    const original = storage.getItem, salvo = dados.get(chave), historico = s.listarCorrecoesValidade();
    storage.getItem = () => {throw Error('Sem leitura');};
    assert.throws(() => s.corrigirValidadeProduto(codigo,'2099-12-31','Data conferida',1), /conferir/);
    assert.equal(p.getDataValidade(),'2000-01-01');assert.deepEqual(s.listarCorrecoesValidade(),historico);
    storage.getItem = original;
    storage.setItem = () => {throw Error('Quota');};
    s.corrigirValidadeProduto(codigo,'2099-12-31','Data conferida',1);
    assert.ok(s.getAvisoPersistencia());assert.equal(dados.get(chave),salvo);
    assert.equal(p.getDataValidade(),'2099-12-31');
    const b = iniciar();new GerenciadorSistema().cadastrarCategoria('Outra aba');
    assert.throws(() => b.s.corrigirValidadeProduto(codigo,'2099-12-31','Data conferida',1), /Conflito/);
    assert.equal(b.p.getDataValidade(),'2000-01-01');
});

function tela(s) {
    const elementos = new Map();
    function elemento(id) {
        if (!elementos.has(id)) elementos.set(id, {value:'',innerHTML:'',textContent:'',eventos:{},
            addEventListener(tipo,fn){this.eventos[tipo]=fn;},focus(){this.focado=true;},scrollIntoView(){},reset(){}});
        return elementos.get(id);
    }
    const aba = {click(){this.clicada=true;}};
    globalThis.document = {getElementById:elemento,querySelector:()=>aba};
    const ui = new ControladorInterface(s);
    const notificacoes=[];ui.exibirNotificacao=(...args)=>notificacoes.push(args);
    ui.renderizarTudo=()=>{ui.renderizarEstoque();ui.renderizarDashboard();};
    ui.configurarEventosEstoque();ui.renderizarTudo();
    return {ui,elemento,aba,notificacoes};
}

test('UI encaminha alertas ao formulário, salva, atualiza histórico e escapa conteúdo', () => {
    const {s,p}=iniciar();const {ui,elemento,aba,notificacoes}=tela(s);
    assert.match(elemento('tbody-alertas-estoque').innerHTML,/Corrigir data/);
    elemento('tbody-alertas-estoque').eventos.click({target:{closest:()=>({dataset:{codigo,validadeAcao:'corrigir'}})}});
    assert.ok(aba.clicada);assert.equal(elemento('correcao-validade-produto').value,codigo);
    assert.match(elemento('correcao-validade-atual').textContent,/2000-01-01.*vencido/);
    assert.ok(elemento('correcao-validade-nova').focado);assert.equal(elemento('correcao-validade-nova').value,'');
    elemento('correcao-validade-nova').value='2099-12-31';
    elemento('correcao-validade-motivo').value='<img src=x onerror=alert(1)> conferido';
    elemento('form-corrigir-validade').eventos.submit({preventDefault(){}});
    assert.equal(p.getDataValidade(),'2099-12-31');
    assert.equal(elemento('correcao-validade-produto').value,codigo);
    assert.match(elemento('tbody-correcoes-validade').innerHTML,/&lt;img/);
    assert.doesNotMatch(elemento('tbody-correcoes-validade').innerHTML,/<img/);
    assert.doesNotMatch(elemento('tbody-alertas-estoque').innerHTML,/Vencido/);
    assert.match(notificacoes.at(-1)[0],/registrada/);
    elemento('correcao-validade-nova').value='';elemento('correcao-validade-motivo').value='Teste';
    elemento('form-corrigir-validade').eventos.submit({preventDefault(){}});
    assert.equal(notificacoes.at(-1)[1],'erro');assert.equal(p.getDataValidade(),'2099-12-31');
    delete globalThis.document;
});

test('UI Dar baixa só prepara SAIDA; redução exige envio explícito do formulário', () => {
    const {s,p}=iniciar();const {elemento}=tela(s), quantidade=p.getQtdEstoque();
    elemento('tbody-lista-produtos').eventos.click({target:{closest:()=>({dataset:{codigo,validadeAcao:'baixa'}})}});
    assert.equal(elemento('mov-produto-codigo').value,codigo);assert.equal(elemento('mov-tipo').value,'SAIDA');
    assert.equal(elemento('mov-qtd').value,String(quantidade));assert.equal(p.getQtdEstoque(),quantidade);
    elemento('form-movimentacao-estoque').eventos.submit({preventDefault(){}});
    assert.equal(p.getQtdEstoque(),0);assert.equal(p.getDataValidade(),'2000-01-01');
    assert.equal(s.listarMovimentacoesEstoque()[0].getTipo(),'SAIDA');
    assert.doesNotMatch(elemento('tbody-alertas-estoque').innerHTML,/Vencido/);
    assert.equal(elemento('kpi-produtos-vencidos').textContent,'0 item(ns)');
    delete globalThis.document;
});
