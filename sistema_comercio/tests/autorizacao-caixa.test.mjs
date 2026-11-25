import { cpfSintetico } from '../dist/testes/DocumentosSinteticos.js';
import test from 'node:test';
import { prepararOperadorCompleto } from './apoio-permissoes.mjs';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { ControladorInterface } from '../dist/ui/ControladorInterface.js';
import { SessaoCaixa } from '../dist/modelos/CaixaEVendas.js';
import { Caixa, Cargo, Funcionario, StatusCaixa } from '../dist/modelos/Entidades.js';

const chave='sistema_comercio_poo_v1', codigo='7891000100101';
function iniciar() {
    delete globalThis.document;
    const dados=new Map(), storage={getItem:k=>dados.get(k)??null,setItem:(k,v)=>dados.set(k,String(v))};
    Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
    return {s:prepararOperadorCompleto(new GerenciadorSistema()),dados,storage};
}
const vender=(s,id=1)=>s.registrarVenda(id,[{codigoBarras:codigo,qtdVenda:1}],[{idForma:2,valorPago:28.90}]);
function autorizar(s,id=3) {s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(id,true,'Cobertura do caixa aprovada');}

test('cargo de caixa e gerente habilitam; estoquista precisa de autorização individual',()=>{
    const {s}=iniciar();
    assert.equal(s.getFuncionarioLogado().getIdFuncionario(),2);
    assert.equal(s.buscarFuncionarioPorId(2).podeOperarCaixa(),true);
    for (const id of [3]) {
        const f=s.buscarFuncionarioPorId(id);assert.equal(f.podeOperarCaixa(),false);
        const caixa=new Caixa(99,99,StatusCaixa.LIVRE);
        assert.throws(()=>new SessaoCaixa(99,'Agora',0,f,caixa),/autorização/);
        assert.equal(caixa.getStatusCaixa(),StatusCaixa.LIVRE);
    }
    const operador=new Funcionario(99,cpfSintetico(),'Teste','','2026-11-25',new Cargo(99,'  OPERADOR DE CAIXA  ',0,['CAIXA']));
    assert.equal(operador.podeOperarCaixa(),true);
    autorizar(s);assert.equal(s.buscarFuncionarioPorId(3).podeOperarCaixa(),true);
    assert.equal(s.buscarFuncionarioPorId(1).podeOperarCaixa(),true);
});

test('sem gerente, motivo, alvo ou ação válidos não há mutação parcial ou gravação',()=>{
    const {s,dados}=iniciar();
    for (const id of [2,3]) {
        s.definirFuncionarioAtivo(id);const salvo=dados.get(chave);
        assert.throws(()=>s.alterarAutorizacaoCaixa(3,true,'Concessão indevida'),/gerente/);
        assert.equal(dados.get(chave),salvo);
    }
    s.definirFuncionarioAtivo(1);const salvo=dados.get(chave);
    for (const motivo of ['','   ','abc','a'.repeat(501)]) assert.throws(()=>s.alterarAutorizacaoCaixa(3,true,motivo),/motivo/);
    for (const id of [0,999,NaN]) assert.throws(()=>s.alterarAutorizacaoCaixa(id,true,'Aprovação para cobertura'));
    assert.throws(()=>s.alterarAutorizacaoCaixa(3,'false','Aprovação para cobertura'),/inválida/);
    assert.throws(()=>s.alterarAutorizacaoCaixa(2,false,'Revogar operador nativo'),/cargo/);
    assert.throws(()=>s.alterarAutorizacaoCaixa(3,false,'Já estava bloqueado'),/já/);
    assert.equal(s.buscarFuncionarioPorId(3).podeOperarCaixa(),false);
    assert.deepEqual(s.listarAutorizacoesCaixa(),[]);assert.equal(dados.get(chave),salvo);
});

test('abrir, vender e fechar exigem acesso e identidade da sessão mesmo fora da UI',()=>{
    const {s,dados}=iniciar();
    for (const id of [3]) {
        s.definirFuncionarioAtivo(id);const salvo=dados.get(chave);
        assert.throws(()=>s.abrirSessaoCaixa(2,id,0),/autorização/);
        assert.throws(()=>vender(s),/autorização/);
        if(id===3) assert.throws(()=>s.fecharSessaoCaixa(1),/autorização/);
        assert.equal(dados.get(chave),salvo);
    }
    autorizar(s);s.definirFuncionarioAtivo(3);const salvo=dados.get(chave);
    assert.throws(()=>vender(s),/outro funcionário/);
    assert.throws(()=>s.fecharSessaoCaixa(1),/outro funcionário/);
    assert.throws(()=>s.abrirSessaoCaixa(2,2,0),/ativo/);
    assert.equal(dados.get(chave),salvo);
    s.definirFuncionarioAtivo(1);s.fecharSessaoCaixa(1);
    s.definirFuncionarioAtivo(3);const sessao=s.abrirSessaoCaixa(1,3,100);
    vender(s,sessao.getIdSessao());
    assert.equal(s.listarMovimentacoesEstoque()[0].getFuncionarioResponsavel().getIdFuncionario(),3);
    s.fecharSessaoCaixa(sessao.getIdSessao());
    assert.equal(sessao.getIdResponsavelFechamento(),3);
});

test('revogação interrompe o colaborador; gerente pode vender e encerrar com autor registrado',()=>{
    const {s,dados}=iniciar();autorizar(s);s.fecharSessaoCaixa(1);
    s.definirFuncionarioAtivo(3);const sessao=s.abrirSessaoCaixa(1,3,0);
    s.definirFuncionarioAtivo(1);s.alterarAutorizacaoCaixa(3,false,'Fim da cobertura autorizada');
    s.definirFuncionarioAtivo(3);const salvo=dados.get(chave);
    assert.throws(()=>vender(s,sessao.getIdSessao()),/autorização/);
    assert.throws(()=>s.fecharSessaoCaixa(sessao.getIdSessao()),/autorização/);
    assert.equal(sessao.estaAberta(),true);assert.equal(dados.get(chave),salvo);
    s.definirFuncionarioAtivo(1);
    const vendaGerente = vender(s,sessao.getIdSessao());
    assert.equal(vendaGerente.getOperadorVenda().getIdFuncionario(),1);
    s.fecharSessaoCaixa(sessao.getIdSessao(),0);
    assert.equal(sessao.getIdResponsavelFechamento(),1);
    const novo=new GerenciadorSistema();
    assert.equal(novo.buscarSessaoPorId(sessao.getIdSessao()).getIdResponsavelFechamento(),1);
    assert.equal(novo.buscarFuncionarioPorId(3).podeOperarCaixa(),false);
});

test('histórico é snapshot por cópia, recarrega e gerente já possui acesso sem autoconcessão',()=>{
    const {s}=iniciar();autorizar(s);const r=s.listarAutorizacoesCaixa()[0];
    assert.equal(r.antes,false);assert.equal(r.depois,true);assert.equal(r.idGerente,1);
    assert.equal(r.idFuncionario,3);assert.ok(Number.isFinite(Date.parse(r.dataHora)));
    r.motivo='Alterado';r.nomeGerente='Falso';
    assert.notEqual(s.listarAutorizacoesCaixa()[0].motivo,'Alterado');
    s.alterarAutorizacaoCaixa(3,false,'Fim da cobertura de teste');
    assert.equal(s.listarAutorizacoesCaixa()[0].antes,true);assert.equal(s.listarAutorizacoesCaixa()[0].depois,false);
    assert.throws(()=>s.alterarAutorizacaoCaixa(1,true,'Gerente cobrindo o turno'),/Gerente já possui/);
    const novo=new GerenciadorSistema();assert.deepEqual(novo.listarAutorizacoesCaixa(),s.listarAutorizacoesCaixa());
    assert.equal(novo.buscarFuncionarioPorId(1).podeOperarCaixa(),true);
    novo.resetarDadosParaPadrao();assert.deepEqual(novo.listarAutorizacoesCaixa(),[]);
});

test('legado sem permissão não recebe autorização implícita e preserva sessões/vendas antigas',()=>{
    const {s,dados}=iniciar();const bruto=JSON.parse(dados.get(chave));
    for(const f of bruto.funcionarios) delete f.autorizadoNoCaixa;
    delete bruto.autorizacoesCaixa;bruto.sessoesCaixa[0].idFuncionario=3;bruto.funcionarioAtivoId=3;
    dados.set(chave,JSON.stringify(bruto));const novo=new GerenciadorSistema();
    assert.equal(novo.getAvisoPersistencia(),null);assert.equal(novo.listarVendas().length,s.listarVendas().length);
    assert.equal(novo.buscarSessaoPorId(1).getFuncionario().getIdFuncionario(),3);
    assert.equal(novo.buscarFuncionarioPorId(3).podeOperarCaixa(),false);
    assert.equal(novo.buscarSessaoPorId(1).getIdResponsavelFechamento(),undefined);
    assert.deepEqual(novo.listarAutorizacoesCaixa(),[]);
    assert.throws(()=>vender(novo),/autorização/);
    novo.definirFuncionarioAtivo(1);novo.fecharSessaoCaixa(1);
    assert.equal(novo.buscarSessaoPorId(1).getIdResponsavelFechamento(),1);
});

test('falha de leitura e conflito bloqueiam autorização antes de mutar; quota preserva último JSON e avisa',()=>{
    const {s,dados,storage}=iniciar();s.definirFuncionarioAtivo(1);
    const salvo=dados.get(chave), get=storage.getItem;
    storage.getItem=()=>{throw Error('Leitura');};assert.throws(()=>s.alterarAutorizacaoCaixa(3,true,'Cobrir caixa hoje'),/conferir/);
    assert.equal(s.buscarFuncionarioPorId(3).podeOperarCaixa(),false);assert.equal(dados.get(chave),salvo);
    storage.getItem=get;storage.setItem=()=>{throw Error('Quota');};s.alterarAutorizacaoCaixa(3,true,'Cobrir caixa hoje');
    assert.ok(s.getAvisoPersistencia());assert.equal(dados.get(chave),salvo);
    const b=iniciar();b.s.definirFuncionarioAtivo(1);new GerenciadorSistema().cadastrarCategoria('Outra aba');
    const atual=b.dados.get(chave);assert.throws(()=>b.s.alterarAutorizacaoCaixa(3,true,'Cobrir caixa hoje'),/Conflito/);
    assert.equal(b.s.buscarFuncionarioPorId(3).podeOperarCaixa(),false);assert.equal(b.dados.get(chave),atual);
});

function tela(s) {
    const elementos=new Map();
    const el=id=>{if(!elementos.has(id)) elementos.set(id,{value:'',innerHTML:'',textContent:'',style:{},eventos:{},querySelectorAll(){return [];},addEventListener(t,fn){this.eventos[t]=fn;}});return elementos.get(id);};
    globalThis.document={getElementById:el,querySelectorAll:selector=>[el(selector)]};
    const ui=new ControladorInterface(s),notificacoes=[];
    ui.exibirNotificacao=(...a)=>notificacoes.push(a);ui.renderizarTudo=()=>{ui.renderizarPDV();ui.renderizarEquipe();};
    ui.configurarEventosEquipe();ui.configurarEventosPDV();ui.configurarEventosTopo();ui.renderizarTudo();
    return {ui,el,notificacoes};
}

test('UI de autorização permite gerente, bloqueia outro cargo e escapa histórico',()=>{
    const {s}=iniciar();const {el,notificacoes}=tela(s);
    assert.equal(el('btn-salvar-autorizacao-caixa').disabled,true);
    el('autorizacao-caixa-funcionario').value='3';el('autorizacao-caixa-acao').value='conceder';el('autorizacao-caixa-motivo').value='Cobertura autorizada';
    const submit=()=>el('form-autorizacao-caixa').eventos.submit({preventDefault(){}});
    submit();assert.equal(notificacoes.at(-1)[1],'erro');assert.equal(s.buscarFuncionarioPorId(3).podeOperarCaixa(),false);
    s.definirFuncionarioAtivo(1);assert.equal(el('btn-salvar-autorizacao-caixa').disabled,false);
    el('autorizacao-caixa-motivo').value='<script>teste</script> aprovado';submit();
    assert.equal(s.buscarFuncionarioPorId(3).podeOperarCaixa(),true);
    assert.match(el('tbody-autorizacoes-caixa').innerHTML,/&lt;script&gt;/);
    assert.doesNotMatch(el('tbody-autorizacoes-caixa').innerHTML,/<script>/);
    delete globalThis.document;
});

test('UI informa sessão alheia e limpa carrinho/pagamentos ao trocar funcionário',()=>{
    const {s}=iniciar();const {ui,el}=tela(s);
    assert.equal(el('#btn-finalizar-venda').disabled,false);
    ui.carrinhoVenda=[{codigoBarras:codigo,qtdVenda:1}];ui.pagamentosVenda=[{idForma:2,valorPago:28.90}];
    el('select-operador-ativo').value='3';el('select-operador-ativo').eventos.change();
    assert.deepEqual(ui.carrinhoVenda,[]);assert.deepEqual(ui.pagamentosVenda,[]);
    assert.match(el('aviso-acesso-caixa').textContent,/autorização/);assert.equal(el('#btn-finalizar-venda').disabled,true);
    autorizar(s);s.definirFuncionarioAtivo(3);
    assert.match(el('aviso-acesso-caixa').textContent,/Selecione/);
    assert.equal(s.obterSessaoSelecionada(),undefined);
    assert.equal(el('btn-fechar-sessao-atual').disabled,true);
    s.definirFuncionarioAtivo(1);s.selecionarSessaoCaixa(1);assert.equal(el('btn-fechar-sessao-atual').disabled,false);
    delete globalThis.document;
});
