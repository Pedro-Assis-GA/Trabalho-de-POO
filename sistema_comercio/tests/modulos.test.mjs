import { cpfSintetico, cnpjSintetico } from '../dist/testes/DocumentosSinteticos.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { Cargo, ModuloSistema as M, TipoMovimentacao } from '../dist/modelos/Entidades.js';
import { ControladorInterface } from '../dist/ui/ControladorInterface.js';

const chave='sistema_comercio_poo_v1', codigo='7891000100101';
function iniciar() {
    delete globalThis.document;
    const dados=new Map(), storage={getItem:k=>dados.get(k)??null,setItem:(k,v)=>dados.set(k,String(v))};
    Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
    return {s:new GerenciadorSistema(),dados,storage};
}
function apoio(s,permissoes=[]) {
    s.definirFuncionarioAtivo(1);
    const cargo=s.cadastrarCargo('Apoio <teste>',2000,permissoes);
    return s.cadastrarFuncionario(cpfSintetico(),'Apoio <teste>','teste','2026-11-25',cargo.getIdCargo(),[]).getIdFuncionario();
}
function liberar(s,id,modulo,permitir=true) {
    s.definirFuncionarioAtivo(1);s.alterarAutorizacao(id,modulo,permitir,'Cobertura autorizada para teste');s.definirFuncionarioAtivo(id);
}

test('cargo tem permissões explícitas sem inferência por nome; duplicatas são deduplicadas',()=>{
    assert.deepEqual(new Cargo(9,'Operador de Caixa',0).getPermissoes(),[]);
    assert.deepEqual(new Cargo(9,'Gerente Geral',0,[]).getPermissoes(),[]);
    const lista=[M.ESTOQUE,M.ESTOQUE,M.COMPRAS], c=new Cargo(9,'Fiscal',0,lista);
    lista.push(M.CAIXA);c.getPermissoes().push(M.CAIXA);
    assert.deepEqual(c.getPermissoes(),[M.ESTOQUE,M.COMPRAS]);
    for(const invalido of [null,'CAIXA',['INVALIDO'],[M.CAIXA,'estoque']]) assert.throws(()=>new Cargo(9,'Fiscal',0,invalido),/inválid/);
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);const salvo=dados.get(chave),total=s.listarCargos().length;
    assert.throws(()=>s.cadastrarCargo('Fiscal',0,['INVALIDO']),/inválido/);assert.equal(dados.get(chave),salvo);assert.equal(s.listarCargos().length,total);
});

for(const modulo of Object.values(M)) test(`autorização ${modulo} libera só esse módulo no serviço`,()=>{
    const {s,dados}=iniciar();const id=apoio(s);
    if(modulo===M.CAIXA) s.fecharSessaoCaixa(1);
    liberar(s,id,modulo);
    const f=s.buscarFuncionarioPorId(id);
    for(const m of Object.values(M)) assert.equal(f.temAcessoModulo(m),m===modulo);
    const operacoes={
        CAIXA:()=>s.abrirSessaoCaixa(2,id,0),
        ESTOQUE:()=>s.cadastrarCategoria('Permitido'),
        COMPRAS:()=>s.cadastrarFornecedor(cnpjSintetico(),'Permitido','teste@example.invalid',[]),
        EQUIPE:()=>s.cadastrarCargo('Permitido',0,[M.CAIXA])
    };
    for(const m of Object.values(M).filter(m=>m!==modulo)) {
        const salvo=dados.get(chave);assert.throws(operacoes[m],/autorização/);assert.equal(dados.get(chave),salvo);
    }
    assert.doesNotThrow(operacoes[modulo]);
    const novo=new GerenciadorSistema();assert.equal(novo.buscarFuncionarioPorId(id).temAcessoModulo(modulo),true);
});

test('todos os mutadores pertinentes são bloqueados antes de alterar sem permissão',()=>{
    const {s,dados}=iniciar(),id=apoio(s);s.definirFuncionarioAtivo(id);
    const salvo=dados.get(chave),hist=s.listarMovimentacoesEstoque().length;
    const operacoes=[()=>s.cadastrarCategoria('Negado'),()=>s.cadastrarCargo('Negado',0,[]),
        ()=>s.cadastrarFuncionario(cpfSintetico(2),'Negado','teste','2026-11-25',1,[]),
        ()=>s.cadastrarProduto('NEGADO','Negado',1,1,'UN',0,0,1),
        ()=>s.corrigirValidadeProduto(codigo,'2099-01-01','Data conferida',1),
        ()=>s.realizarAjusteEstoque(codigo,TipoMovimentacao.SAIDA,1,1),
        ()=>s.cadastrarFornecedor(cnpjSintetico(),'Negado','',[]),
        ()=>s.registrarCompra(1,1,[{codigoBarras:codigo,qtdCompra:1,custoUnitario:1}]),
        ()=>s.cadastrarCaixa(77),()=>s.cadastrarCliente('Negado','',cpfSintetico(2))];
    for(const acao of operacoes) {assert.throws(acao,/autorização/);assert.equal(dados.get(chave),salvo);}
    assert.equal(s.listarMovimentacoesEstoque().length,hist);
});

test('revogação afeta só o módulo individual e auditoria é tipada, persistente e por cópia',()=>{
    const {s}=iniciar(),id=apoio(s,[M.EQUIPE]);liberar(s,id,M.ESTOQUE);liberar(s,id,M.COMPRAS);
    liberar(s,id,M.ESTOQUE,false);const f=s.buscarFuncionarioPorId(id);
    assert.equal(f.temAcessoModulo(M.ESTOQUE),false);assert.equal(f.temAcessoModulo(M.COMPRAS),true);assert.equal(f.temAcessoModulo(M.EQUIPE),true);
    assert.throws(()=>s.cadastrarCategoria('Negado'),/ESTOQUE/);
    assert.doesNotThrow(()=>s.registrarCompra(1,id,[{codigoBarras:codigo,qtdCompra:1,custoUnitario:1}]));
    const registros=s.listarAutorizacoes();assert.equal(registros[0].modulo,M.ESTOQUE);assert.equal(registros[0].antes,true);assert.equal(registros[0].depois,false);
    registros[0].modulo=M.CAIXA;registros[0].motivo='Alterado';
    assert.equal(s.listarAutorizacoes()[0].modulo,M.ESTOQUE);assert.notEqual(s.listarAutorizacoes()[0].motivo,'Alterado');
    assert.deepEqual(new GerenciadorSistema().listarAutorizacoes(),s.listarAutorizacoes());
});

test('permissão herdada não é revogada por autorização individual e Equipe não concede autoridade de gerente',()=>{
    const {s,dados}=iniciar(),id=apoio(s,[M.ESTOQUE,M.EQUIPE]);
    const salvo=dados.get(chave);assert.throws(()=>s.alterarAutorizacao(id,M.ESTOQUE,false,'Revogar herdado'),/cargo/);assert.equal(dados.get(chave),salvo);
    s.definirFuncionarioAtivo(id);const antes=dados.get(chave);
    assert.throws(()=>s.alterarAutorizacao(2,M.ESTOQUE,true,'Conceder indevidamente'),/gerente/);assert.equal(dados.get(chave),antes);
    assert.equal(s.buscarFuncionarioPorId(id).temAcessoModulo(M.ESTOQUE),true);
});

test('migração apenas de campos ausentes converte cargo/booleano/histórico antigos para Caixa',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(3,true,'Cobertura antiga');
    const bruto=JSON.parse(dados.get(chave));
    bruto.cargos.forEach(c=>delete c.permissoes);bruto.funcionarios.forEach(f=>delete f.autorizacoesIndividuais);bruto.autorizacoesCaixa.forEach(r=>delete r.modulo);
    dados.set(chave,JSON.stringify(bruto));const novo=new GerenciadorSistema();
    assert.equal(novo.getAvisoPersistencia(),null);assert.equal(novo.buscarFuncionarioPorId(2).podeOperarCaixa(),true);
    assert.equal(novo.buscarFuncionarioPorId(3).podeOperarCaixa(),true);assert.equal(novo.buscarFuncionarioPorId(3).temAcessoModulo(M.ESTOQUE),true);
    assert.equal(novo.buscarFuncionarioPorId(1).podeOperarCaixa(),true);
    assert.equal(novo.listarAutorizacoes().length,1);assert.equal(novo.listarAutorizacoes()[0].modulo,M.CAIXA);
    assert.equal(novo.listarVendas().length,1);
});

test('listas novas vazias não reativam colaboradores; gerente segue acesso total e módulo inválido preserva original',()=>{
    const {s,dados}=iniciar();s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(3,true,'Cobertura antiga');
    const bruto=JSON.parse(dados.get(chave));bruto.cargos.forEach(c=>c.permissoes=[]);bruto.funcionarios.forEach(f=>f.autorizacoesIndividuais=[]);
    const texto=JSON.stringify(bruto);dados.set(chave,texto);const novo=new GerenciadorSistema();
    assert.equal(novo.getAvisoPersistencia(),null);
    for(const f of novo.listarFuncionarios()) for(const m of Object.values(M)) assert.equal(f.temAcessoModulo(m),f.ehGerente());
    bruto.funcionarios[0].autorizacoesIndividuais=['INVALIDO'];const invalido=JSON.stringify(bruto);dados.set(chave,invalido);
    assert.match(new GerenciadorSistema().getAvisoPersistencia(),/preservado/);assert.equal(dados.get(chave),invalido);
});

test('leitura/conflito bloqueiam antes de mutar e quota não substitui o último JSON',()=>{
    const {s,dados,storage}=iniciar(),id=apoio(s),salvo=dados.get(chave),get=storage.getItem;
    storage.getItem=()=>{throw Error('Leitura');};assert.throws(()=>s.alterarAutorizacao(id,M.ESTOQUE,true,'Liberação de teste'),/conferir/);
    assert.equal(s.buscarFuncionarioPorId(id).temAcessoModulo(M.ESTOQUE),false);assert.equal(dados.get(chave),salvo);
    storage.getItem=get;storage.setItem=()=>{throw Error('Quota');};s.alterarAutorizacao(id,M.ESTOQUE,true,'Liberação de teste');
    assert.ok(s.getAvisoPersistencia());assert.equal(dados.get(chave),salvo);
    const b=iniciar(),outro=apoio(b.s);new GerenciadorSistema().cadastrarCategoria('Outra aba');const atual=b.dados.get(chave);
    assert.throws(()=>b.s.alterarAutorizacao(outro,M.COMPRAS,true,'Liberação de teste'),/Conflito/);assert.equal(b.dados.get(chave),atual);
});

function tela(s) {
    const elementos=new Map(),checks=[];
    const el=id=>{if(!elementos.has(id)) elementos.set(id,{value:'',innerHTML:'',textContent:'',style:{},eventos:{},querySelectorAll(){return [];},reset(){},addEventListener(t,fn){this.eventos[t]=fn;}});return elementos.get(id);};
    globalThis.document={getElementById:el,querySelectorAll:q=>q==='input[name="cargo-permissoes"]:checked'?checks:[el(q)]};
    const ui=new ControladorInterface(s),avisos=[];
    ui.exibirNotificacao=(...a)=>avisos.push(a);ui.renderizarTudo=()=>{ui.renderizarEquipe();ui.renderizarPDV();ui.renderizarPermissoesModulos();};
    ui.configurarEventosEquipe();ui.configurarEventosPDV();ui.renderizarTudo();
    return {ui,el,checks,avisos};
}

test('UI cadastra cargo com módulos marcados e autoriza o tipo selecionado, com histórico escapado',()=>{
    const {s}=iniciar(),id=apoio(s);const {el,checks}=tela(s);
    el('cargo-nome').value='Fiscal';el('cargo-salario').value='2000';checks.push({value:M.ESTOQUE},{value:M.COMPRAS});
    el('form-novo-cargo').eventos.submit({preventDefault(){}});
    assert.deepEqual(s.listarCargos().at(-1).getPermissoes(),[M.ESTOQUE,M.COMPRAS]);
    el('autorizacao-caixa-modulo').value=M.ESTOQUE;el('autorizacao-caixa-modulo').eventos.change();
    el('autorizacao-caixa-funcionario').value=String(id);el('autorizacao-caixa-acao').value='conceder';el('autorizacao-caixa-motivo').value='<img src=x> conferido';
    el('form-autorizacao-caixa').eventos.submit({preventDefault(){}});
    assert.equal(s.buscarFuncionarioPorId(id).temAcessoModulo(M.ESTOQUE),true);assert.equal(s.buscarFuncionarioPorId(id).podeOperarCaixa(),false);
    assert.match(el('tbody-autorizacoes-caixa').innerHTML,/Estoque/);assert.match(el('tbody-autorizacoes-caixa').innerHTML,/&lt;img/);assert.doesNotMatch(el('tbody-autorizacoes-caixa').innerHTML,/<img/);
    assert.match(el('tbody-lista-funcionarios').innerHTML,/Estoque: Individual/);
    delete globalThis.document;
});

test('UI sinaliza falta de permissão e bloqueia os formulários do módulo',()=>{
    const {s}=iniciar();const {ui,el}=tela(s);
    assert.equal(el('aviso-acesso-estoque').hidden,false);assert.equal(el('#form-novo-produto input, #form-novo-produto select, #form-novo-produto textarea, #form-novo-produto button').disabled,true);
    s.definirFuncionarioAtivo(3);ui.renderizarTudo();assert.equal(el('aviso-acesso-estoque').hidden,true);assert.equal(el('aviso-acesso-equipe').hidden,false);
    assert.ok(el('tbody-historico-vendas').innerHTML.includes('Caixa #1'));
    delete globalThis.document;
});

test('histórico e mensagens usam número/ID do Caixa da venda e sobrevivem à restauração',()=>{
    const {s}=iniciar();const caixa=s.cadastrarCaixa(77),sessao=s.abrirSessaoCaixa(caixa.getIdCaixa(),2,0);
    const {ui,el,avisos}=tela(s);
    ui.carrinhoVenda=[{codigoBarras:codigo,qtdVenda:1}];ui.pagamentosVenda=[{idForma:2,valorPago:28.90}];
    el('btn-finalizar-venda').eventos.click();
    assert.match(avisos.at(-1)[0],/Caixa #77/);assert.equal(s.listarVendas()[0].getSessaoCaixa().getCaixa().getIdCaixa(),caixa.getIdCaixa());
    assert.match(el('tbody-historico-vendas').innerHTML,new RegExp(`Caixa #77 \\(ID ${caixa.getIdCaixa()}\\)`));
    s.definirFuncionarioAtivo(1);s.selecionarSessaoCaixa(sessao.getIdSessao());el('btn-fechar-sessao-atual').eventos.click();assert.match(avisos.at(-1)[0],/Caixa #77/);
    delete globalThis.document;const novo=new GerenciadorSistema();
    const venda=novo.listarVendas()[0];assert.equal(venda.getSessaoCaixa().getCaixa().getNumeroCaixa(),77);assert.equal(venda.getSessaoCaixa().getIdSessao(),sessao.getIdSessao());
    const visual=tela(novo);assert.match(visual.el('tbody-historico-vendas').innerHTML,/Caixa #77/);assert.match(visual.el('tbody-historico-vendas').innerHTML,/Caixa #1/);
    delete globalThis.document;
});
