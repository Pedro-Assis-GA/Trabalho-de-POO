import { cnpjSintetico } from '../dist/testes/DocumentosSinteticos.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { ModuloSistema as M, TipoMovimentacao as T, StatusCaixa } from '../dist/modelos/Entidades.js';
import { Venda } from '../dist/modelos/CaixaEVendas.js';
import { interfaceSimulada, alvoBotao } from './apoio-interface.mjs';

const chave='sistema_comercio_poo_v1',arroz='7891000100101',iogurte='7891000200404';
function iniciar(){delete globalThis.document;delete globalThis.window;const dados=new Map(),storage={getItem:k=>dados.get(k)??null,setItem:(k,v)=>dados.set(k,String(v))};Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});return {s:new GerenciadorSistema(),dados,storage};}
const vender=(s,id)=>s.registrarVenda(id,[{codigoBarras:arroz,qtdVenda:1}],[{idForma:2,valorPago:28.90}]);

test('gerente acessa os quatro módulos sem concessão inventada e registra a própria venda em sessão alheia',()=>{
    const {s}=iniciar();s.definirFuncionarioAtivo(1);
    for(const modulo of Object.values(M)) assert.equal(s.getFuncionarioLogado().temAcessoModulo(modulo),true);
    assert.throws(()=>s.getFuncionarioLogado().temAcessoModulo('INVALIDO'),/inválido/);
    assert.deepEqual(s.listarAutorizacoes(),[]);s.selecionarSessaoCaixa(1);
    const venda=vender(s,1);assert.equal(venda.getOperadorVenda().getIdFuncionario(),1);assert.equal(venda.getSessaoCaixa().getFuncionario().getIdFuncionario(),2);
    assert.equal(s.listarMovimentacoesEstoque()[0].getFuncionarioResponsavel().getIdFuncionario(),1);
    const novo=new GerenciadorSistema();assert.equal(novo.listarVendas()[0].getIdOperadorRegistrado(),1);assert.equal(novo.obterSessaoSelecionada().getIdSessao(),1);
});

test('cadastro de caixas valida inteiro positivo e unicidade, sem estado parcial',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const salvo=dados.get(chave),total=s.listarCaixas().length;
    for(const numero of [0,-1,1.1,NaN,Infinity,1]) {assert.throws(()=>s.cadastrarCaixa(numero));assert.equal(dados.get(chave),salvo);assert.equal(s.listarCaixas().length,total);}
    assert.equal(s.cadastrarCaixa(77).getStatusCaixa(),StatusCaixa.LIVRE);
    s.definirFuncionarioAtivo(3);const antes=dados.get(chave);assert.throws(()=>s.cadastrarCaixa(78),/autorização/);assert.equal(dados.get(chave),antes);
});

test('sessões em caixas distintos coexistem; ocupado/manutenção não reabre',()=>{
    const {s,dados}=iniciar();const segunda=s.abrirSessaoCaixa(2,2,200);
    assert.equal(s.listarSessoesCaixa().filter(x=>x.estaAberta()).length,2);assert.equal(s.buscarSessaoPorId(1).estaAberta(),true);
    const salvo=dados.get(chave);assert.throws(()=>s.abrirSessaoCaixa(2,2,0),/não está livre/);assert.throws(()=>s.abrirSessaoCaixa(3,2,0),/não está livre/);assert.equal(dados.get(chave),salvo);
    s.selecionarSessaoCaixa(1);vender(s,1);
    assert.equal(segunda.calcularTotalVendas(),0);assert.equal(s.obterSessaoSelecionada().getIdSessao(),1);
    s.fecharSessaoCaixa(segunda.getIdSessao());assert.equal(s.buscarSessaoPorId(1).estaAberta(),true);assert.equal(s.obterSessaoSelecionada().getIdSessao(),1);
});

test('seleção persiste por funcionário sem escolher a primeira global e colaborador não usa sessão alheia',()=>{
    const {s,dados}=iniciar();const segunda=s.abrirSessaoCaixa(2,2,0);s.selecionarSessaoCaixa(1);
    assert.equal(new GerenciadorSistema().obterSessaoSelecionada().getIdSessao(),1);
    s.definirFuncionarioAtivo(1);assert.equal(s.obterSessaoSelecionada(),undefined);s.selecionarSessaoCaixa(segunda.getIdSessao());
    assert.equal(new GerenciadorSistema().obterSessaoSelecionada().getIdSessao(),segunda.getIdSessao());
    s.alterarAutorizacaoCaixa(3,true,'Cobertura de teste');s.definirFuncionarioAtivo(3);
    const salvo=dados.get(chave);assert.equal(s.obterSessaoSelecionada(),undefined);assert.throws(()=>s.selecionarSessaoCaixa(1),/outro funcionário/);assert.throws(()=>vender(s,1),/outro funcionário/);assert.equal(dados.get(chave),salvo);
    s.definirFuncionarioAtivo(2);assert.equal(s.obterSessaoSelecionada().getIdSessao(),1);
});

test('saldo zero mostra --- e conserva validade; nova entrada restaura vencimento e bloqueio',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const p=s.buscarProdutoPorCodigo(iogurte),data=p.getDataValidade();
    s.realizarAjusteEstoque(iogurte,T.SAIDA,p.getQtdEstoque(),1);const tela=interfaceSimulada(s);
    const linha=tela.el('tbody-lista-produtos').innerHTML.split('<tr>').find(x=>x.includes(iogurte));assert.match(linha,/<td>---<\/td>/);assert.doesNotMatch(linha,/badge-danger/);
    assert.equal(p.getDataValidade(),data);assert.equal(JSON.parse(dados.get(chave)).produtos.find(x=>x.codigoBarras===iogurte).dataValidade,data);
    s.realizarAjusteEstoque(iogurte,T.ENTRADA,1,1);
    assert.match(tela.el('tbody-lista-produtos').innerHTML.split('<tr>').find(x=>x.includes(iogurte)),/Vencido:/);
    assert.throws(()=>s.registrarVenda(1,[{codigoBarras:iogurte,qtdVenda:1}],[{idForma:1,valorPago:10}]),/vencido/);tela.destruir();
});

test('produto só é removido zerado; sai das operações sem apagar vendas, SKU ou auditoria',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const salvo=dados.get(chave),p=s.buscarProdutoPorCodigo(arroz);
    assert.throws(()=>s.removerProduto(arroz),/baixa/);assert.equal(dados.get(chave),salvo);assert.deepEqual(s.listarRemocoes(),[]);
    s.realizarAjusteEstoque(arroz,T.SAIDA,p.getQtdEstoque(),1);s.removerProduto(arroz);
    assert.equal(p.estaAtivo(),false);assert.equal(s.listarProdutos().some(x=>x===p),false);assert.equal(s.listarProdutos(true).includes(p),true);
    assert.equal(s.listarVendas()[0].getItens().some(i=>i.getProduto()===p),true);
    assert.throws(()=>vender(s,1),/removido/);assert.throws(()=>s.realizarAjusteEstoque(arroz,T.ENTRADA,1,1),/removido/);
    assert.throws(()=>s.cadastrarProduto(arroz,'Duplicado',1,1,'UN',0,0,1),/Já existe/);
    const copia=s.listarRemocoes();copia[0].descricao='Mudado';assert.notEqual(s.listarRemocoes()[0].descricao,'Mudado');
    const novo=new GerenciadorSistema();assert.equal(novo.buscarProdutoPorCodigo(arroz).estaAtivo(),false);assert.equal(novo.listarVendas().length,1);assert.equal(novo.listarRemocoes()[0].idFuncionario,1);
});

test('carrinho antigo e compra com segundo produto removido são bloqueados sem alterar o primeiro item',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const p=s.buscarProdutoPorCodigo(arroz),v=new Venda(99,'Teste',s.buscarSessaoPorId(1),undefined,s.getFuncionarioLogado());
    v.adicionarItem(p,1);v.adicionarPagamento(s.buscarFormaPagamentoPorId(1),28.90);
    s.realizarAjusteEstoque(arroz,T.AJUSTE,0,1);s.removerProduto(arroz);assert.throws(()=>v.validarVendaParaFinalizacao(),/removido/);
    const outro=s.listarProdutos().find(x=>!x.estaVencido()),antes=outro.getQtdEstoque(),salvo=dados.get(chave);
    assert.throws(()=>s.registrarCompra(1,1,[{codigoBarras:outro.getCodigoBarras(),qtdCompra:1,custoUnitario:1},{codigoBarras:arroz,qtdCompra:1,custoUnitario:1}]),/removido/);
    assert.equal(outro.getQtdEstoque(),antes);assert.equal(dados.get(chave),salvo);
});

test('fornecedor removido mantém compras/vínculos, reserva CNPJ e bloqueia novas compras e vínculos',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const f=s.buscarFornecedorPorId(1),compras=s.listarCompras().length;
    const fornecedorComCnpj = s.cadastrarFornecedor(cnpjSintetico(),'Fornecedor de Teste','',[]);
    s.removerFornecedor(fornecedorComCnpj.getIdFornecedor());
    s.removerFornecedor(1);const salvo=dados.get(chave);
    assert.equal(s.listarFornecedores().includes(f),false);assert.equal(s.listarFornecedores(true).includes(f),true);
    assert.throws(()=>s.registrarCompra(1,1,[{codigoBarras:arroz,qtdCompra:1,custoUnitario:1}]),/removido/);
    assert.throws(()=>s.cadastrarProduto('NOVO','Novo',1,1,'UN',0,0,1,undefined,[1]),/removido/);
    assert.throws(()=>s.cadastrarFornecedor(fornecedorComCnpj.getCnpj(),'Duplicado','',[]),/Já existe/);assert.equal(dados.get(chave),salvo);
    const novo=new GerenciadorSistema();assert.equal(novo.listarCompras().length,compras);assert.equal(novo.listarCompras()[0].getFornecedor().getIdFornecedor(),1);
    assert.equal(novo.buscarFornecedorPorId(1).estaAtivo(),false);assert.equal(novo.buscarProdutoPorCodigo(arroz).getFornecedores()[0].getIdFornecedor(),1);
});

test('remoções respeitam permissão, falha de leitura e concorrência antes de mutar',()=>{
    const {s,dados,storage}=iniciar();const salvo=dados.get(chave);
    assert.throws(()=>s.removerProduto(arroz),/autorização/);assert.throws(()=>s.removerFornecedor(1),/autorização/);assert.equal(dados.get(chave),salvo);
    s.definirFuncionarioAtivo(1);const ler=storage.getItem,antes=dados.get(chave);storage.getItem=()=>{throw Error('Leitura');};
    assert.throws(()=>s.removerFornecedor(1),/conferir/);assert.equal(s.buscarFornecedorPorId(1).estaAtivo(),true);assert.equal(dados.get(chave),antes);
    storage.getItem=ler;new GerenciadorSistema().cadastrarCategoria('Outra aba');const atualizado=dados.get(chave);
    assert.throws(()=>s.removerFornecedor(1),/Conflito/);assert.equal(s.buscarFornecedorPorId(1).estaAtivo(),true);assert.equal(dados.get(chave),atualizado);
});

test('abas sem permissão ficam inacessíveis; troca de funcionário redireciona ao Dashboard',()=>{
    const {s}=iniciar(),tela=interfaceSimulada(s);
    assert.equal(tela.el('nav-pdv').hidden,false);assert.equal(tela.el('nav-estoque').hidden,true);assert.equal(tela.el('tab-estoque').hidden,true);
    tela.el('nav-estoque').eventos.click();assert.equal(tela.ui.abaAtual,'dashboard');assert.equal(tela.el('tab-estoque').classList.contains('active'),false);
    s.definirFuncionarioAtivo(1);for(const b of tela.botoes)assert.equal(b.hidden,false);tela.el('nav-equipe').click();assert.equal(tela.ui.abaAtual,'equipe');
    tela.mudar('select-operador-ativo',3);assert.equal(tela.ui.abaAtual,'dashboard');assert.equal(tela.el('tab-equipe').hidden,true);assert.equal(tela.el('nav-pdv').hidden,true);
    s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(3,true,'Cobertura');s.definirFuncionarioAtivo(3);assert.equal(tela.el('nav-pdv').hidden,false);
    s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(3,false,'Fim da cobertura');s.definirFuncionarioAtivo(3);assert.equal(tela.el('nav-pdv').hidden,true);tela.destruir();
});

test('UI cadastra caixa, abre outro sem fechar primeiro e seleciona explicitamente a venda',()=>{
    const {s}=iniciar();s.definirFuncionarioAtivo(1);const tela=interfaceSimulada(s);
    tela.el('novo-caixa-numero').value='77';tela.enviar('form-novo-caixa');assert.match(tela.avisos.at(-1)[0],/Caixa #77/);
    const caixa=s.listarCaixas().find(c=>c.getNumeroCaixa()===77);tela.el('sessao-caixa-id').value=String(caixa.getIdCaixa());tela.el('sessao-valor-inicial').value='10';tela.enviar('form-abrir-sessao');
    const sessao=s.obterSessaoSelecionada();assert.equal(sessao.getCaixa().getNumeroCaixa(),77);assert.equal(s.buscarSessaoPorId(1).estaAberta(),true);assert.equal(tela.el('painel-abrir-sessao').style.display,'block');
    tela.ui.carrinhoVenda=[{codigoBarras:arroz,qtdVenda:1}];tela.ui.pagamentosVenda=[{idForma:2,valorPago:28.90}];
    tela.mudar('pdv-sessao-id',1);assert.deepEqual(tela.ui.carrinhoVenda,[]);assert.deepEqual(tela.ui.pagamentosVenda,[]);assert.equal(s.obterSessaoSelecionada().getIdSessao(),1);
    tela.mudar('pdv-sessao-id',sessao.getIdSessao());tela.ui.carrinhoVenda=[{codigoBarras:arroz,qtdVenda:1}];tela.ui.pagamentosVenda=[{idForma:2,valorPago:28.90}];tela.el('btn-finalizar-venda').click();
    assert.match(tela.avisos.at(-1)[0],/Caixa #77/);assert.equal(s.listarVendas()[0].getSessaoCaixa(),sessao);
    tela.el('btn-fechar-sessao-atual').click();assert.equal(sessao.estaAberta(),false);assert.equal(s.buscarSessaoPorId(1).estaAberta(),true);assert.equal(s.obterSessaoSelecionada(),undefined);tela.destruir();
});

test('UI confirma remoções e oferece registro sem apagar referências históricas',()=>{
    const {s}=iniciar();s.definirFuncionarioAtivo(1);s.realizarAjusteEstoque(arroz,T.AJUSTE,0,1);const tela=interfaceSimulada(s);
    const removerProduto=()=>tela.el('tbody-lista-produtos').eventos.click({target:alvoBotao({removerProduto:arroz})});
    tela.confirmar(false);removerProduto();assert.equal(s.buscarProdutoPorCodigo(arroz).estaAtivo(),true);
    tela.confirmar(true);removerProduto();assert.equal(s.buscarProdutoPorCodigo(arroz).estaAtivo(),false);assert.match(tela.el('tbody-produtos-removidos').innerHTML,/Arroz/);assert.doesNotMatch(tela.el('venda-produto-codigo').innerHTML,new RegExp(arroz));
    tela.el('tbody-lista-fornecedores').eventos.click({target:alvoBotao({removerFornecedor:'1'})});assert.equal(s.buscarFornecedorPorId(1).estaAtivo(),false);assert.match(tela.el('tbody-fornecedores-removidos').innerHTML,/Distribuidora/);tela.destruir();
});

test('legado preserva data, sessão e operador não registrado sem criar atribuição histórica',()=>{
    const {s,dados}=iniciar();const legado=JSON.parse(dados.get(chave));delete legado.sessoesSelecionadas;delete legado.remocoes;
    legado.produtos.forEach(p=>delete p.ativo);legado.fornecedores.forEach(f=>delete f.ativo);legado.vendas.forEach(v=>delete v.idOperadorVenda);
    dados.set(chave,JSON.stringify(legado));const novo=new GerenciadorSistema();assert.equal(novo.getAvisoPersistencia(),null);assert.equal(novo.obterSessaoSelecionada().getIdSessao(),1);
    assert.equal(novo.listarVendas()[0].getIdOperadorRegistrado(),undefined);novo.definirFuncionarioAtivo(1);assert.equal(novo.obterSessaoSelecionada(),undefined);
    novo.cadastrarCategoria('Salvar legado');assert.equal(Object.hasOwn(JSON.parse(dados.get(chave)).vendas[0],'idOperadorVenda'),false);assert.deepEqual(novo.listarRemocoes(),[]);
});
