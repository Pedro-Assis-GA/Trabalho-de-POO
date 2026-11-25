import { cpfSintetico, cnpjSintetico } from '../dist/testes/DocumentosSinteticos.js';
import test from 'node:test';
import { prepararOperadorCompleto } from './apoio-permissoes.mjs';
import assert from 'node:assert/strict';
import { GerenciadorSistema } from '../dist/servicos/GerenciadorSistema.js';
import { Documento, Funcionario, Fornecedor, Cliente } from '../dist/modelos/Entidades.js';
import { Venda } from '../dist/modelos/CaixaEVendas.js';

const chave = 'sistema_comercio_poo_v1';
const cpf = cpfSintetico();
const cnpj = cnpjSintetico();
const cpfComMascara = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
const cnpjComMascara = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
const alterarUltimoDigito = documento => documento.slice(0,-1) + ((Number(documento.at(-1)) + 1) % 10);
function iniciar() {
    const dados = new Map();
    const storage = { getItem: k => dados.get(k) ?? null, setItem: (k,v) => dados.set(k,String(v)) };
    Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
    return { s: prepararOperadorCompleto(new GerenciadorSistema()), dados, storage };
}
const item = [{codigoBarras:'7891000100101',qtdVenda:1}];
const vender = (s,pagamentos) => s.registrarVenda(s.obterSessaoAbertaAtual().getIdSessao(),item,pagamentos);
const pagamento = (idForma,valorPago) => ({idForma,valorPago});

test('PIX e cartões excedentes são rejeitados sem alterar estoque, vendas ou movimentos',()=>{
    for (const forma of [2,3,4]) {
        const {s,dados}=iniciar();const salvo=dados.get(chave);const estoque=s.buscarProdutoPorCodigo(item[0].codigoBarras).getQtdEstoque();
        assert.throws(()=>vender(s,[pagamento(forma,30)]),/PIX e cartões/);
        assert.equal(s.listarVendas().length,1);assert.equal(s.listarMovimentacoesEstoque().length,4);
        assert.equal(s.buscarProdutoPorCodigo(item[0].codigoBarras).getQtdEstoque(),estoque);assert.equal(dados.get(chave),salvo);
    }
});

test('pagamento misto gera troco só do dinheiro e saldo físico líquido',()=>{
    const {s}=iniciar();const sessao=s.obterSessaoAbertaAtual();
    assert.equal(sessao.calcularSaldoEsperado(),170);assert.equal(sessao.calcularSaldoConsolidado(),189.88);
    const v=vender(s,[pagamento(2,20),pagamento(1,20)]);
    assert.equal(v.calcularTroco(),11.10);assert.equal(v.calcularDinheiroLiquido(),8.90);
    assert.equal(sessao.calcularSaldoEsperado(),178.90);assert.equal(sessao.calcularTotalDigital(),39.88);
    assert.equal(sessao.calcularSaldoConsolidado(),218.78);
});

test('somente dinheiro pode gerar troco; somente digital exato não altera gaveta',()=>{
    const {s}=iniciar();const sessao=s.obterSessaoAbertaAtual();
    const v=vender(s,[pagamento(1,50)]);assert.equal(v.calcularTroco(),21.10);
    const antes=sessao.calcularSaldoEsperado();const pix=vender(s,[pagamento(2,28.90)]);
    assert.equal(pix.calcularTroco(),0);assert.equal(sessao.calcularSaldoEsperado(),antes);
    assert.throws(()=>vender(s,[pagamento(2,29),pagamento(1,1)]),/PIX e cartões/);
});

test('fechamento físico registra contagem e diferença e restaura após reload',()=>{
    const {s}=iniciar();const sessao=s.obterSessaoAbertaAtual();
    s.fecharSessaoCaixa(sessao.getIdSessao(),168);
    assert.equal(sessao.getEsperadoNoFechamento(),170);assert.equal(sessao.getValorConferido(),168);assert.equal(sessao.calcularDiferencaFechamento(),-2);
    const novo=new GerenciadorSistema();const fechada=novo.listarSessoesCaixa()[0];
    assert.equal(fechada.getEsperadoNoFechamento(),170);assert.equal(fechada.getValorConferido(),168);assert.equal(fechada.calcularDiferencaFechamento(),-2);
});

test('fechamento sem contagem não inventa conferência nem diferença',()=>{
    const {s}=iniciar();s.fecharSessaoCaixa(1);
    const novo=new GerenciadorSistema();const f=novo.listarSessoesCaixa()[0];
    assert.equal(f.getValorFinal(),170);assert.equal(f.getValorConferido(),undefined);assert.equal(f.calcularDiferencaFechamento(),undefined);
});

test('histórico legado preserva valorFinal sem inventar contagem física',()=>{
    const {s,dados}=iniciar();s.fecharSessaoCaixa(1);
    const bruto=JSON.parse(dados.get(chave));const f=bruto.sessoesCaixa[0];delete f.esperadoNoFechamento;delete f.valorConferido;f.valorFinal=189.88;dados.set(chave,JSON.stringify(bruto));
    const novo=new GerenciadorSistema();assert.equal(novo.listarSessoesCaixa()[0].getValorFinal(),189.88);
    assert.equal(novo.listarSessoesCaixa()[0].getEsperadoNoFechamento(),undefined);assert.equal(novo.listarSessoesCaixa()[0].calcularDiferencaFechamento(),undefined);
});

test('vencido é bloqueado ao adicionar e ao finalizar sem baixar estoque',()=>{
    const {s,dados}=iniciar();const p=s.listarProdutos().find(p=>p.estaVencido());const antes=dados.get(chave);
    assert.throws(()=>s.registrarVenda(1,[{codigoBarras:p.getCodigoBarras(),qtdVenda:1}],[pagamento(1,10)]),/vencido/);
    assert.equal(dados.get(chave),antes);
    const arroz=s.buscarProdutoPorCodigo(item[0].codigoBarras);const v=new Venda(99,'teste',s.obterSessaoAbertaAtual());
    v.adicionarItem(arroz,1);v.adicionarPagamento(s.buscarFormaPagamentoPorId(2),28.90);
    // Simula a virada de validade entre montar o carrinho e finalizar, sem alterar o relógio global.
    arroz.estaVencido=()=>true;assert.throws(()=>v.validarVendaParaFinalizacao(),/vencido/);
});

test('vendas históricas continuam carregando quando produto venceu depois',()=>{
    const {dados}=iniciar();const bruto=JSON.parse(dados.get(chave));bruto.produtos[0].dataValidade='2000-01-01';dados.set(chave,JSON.stringify(bruto));
    const novo=new GerenciadorSistema();assert.equal(novo.listarVendas().length,1);assert.equal(novo.listarVendas()[0].getValorTotal(),39.88);
    assert.equal(novo.getAvisoPersistencia(),null);
});

test('CPF/CNPJ conferem dígitos e normalizam apenas formatação permitida',()=>{
    assert.equal(Documento.validarCPF(cpfComMascara),cpfSintetico());assert.equal(Documento.validarCPF(cpfSintetico(2)),cpfSintetico(2));
    assert.equal(Documento.validarCNPJ(cnpjComMascara),cnpjSintetico());
    for(const cpf of ['11111111111',alterarUltimoDigito(cpfSintetico()),'abc'+cpfSintetico(),'123',''])assert.throws(()=>Documento.validarCPF(cpf));
    for(const cnpj of ['00000000000000',alterarUltimoDigito(cnpjSintetico()),'A'+cnpjSintetico(),'123',''])assert.throws(()=>Documento.validarCNPJ(cnpj));
    assert.throws(()=>Documento.validarDataISO('2026-02-30'));assert.equal(Documento.validarDataISO('2024-02-29'),'2024-02-29');
});

test('documentos novos inválidos são rejeitados nas próprias classes',()=>{
    const {s}=iniciar();const cargo=s.listarCargos()[0];
    assert.throws(()=>new Funcionario(9,'123','Teste','teste','2026-11-23',cargo));
    assert.throws(()=>new Fornecedor(9,'123','Teste','teste@example.invalid'));
    assert.throws(()=>new Cliente(9,'Teste','123','123'));
});

test('documentos duplicados com e sem máscara não criam cadastros',()=>{
    const {s,dados}=iniciar();s.cadastrarFuncionario(cpfComMascara,'Teste','teste','2026-11-23',1,[]);
    s.cadastrarCliente('Cliente teste','123',cpfComMascara);s.cadastrarFornecedor(cnpjComMascara,'Fornecedor teste','teste@example.invalid',[]);
    const antes=dados.get(chave);
    assert.throws(()=>s.cadastrarFuncionario(cpfSintetico(),'Outro','teste','2026-11-23',1,[]),/Já existe/);
    assert.throws(()=>s.cadastrarCliente('Outro','123',cpfSintetico()),/Já existe/);
    assert.throws(()=>s.cadastrarFornecedor(cnpjSintetico(),'Outro','teste@example.invalid',[]),/Já existe/);
    assert.equal(dados.get(chave),antes);
});

test('documentos legados são restaurados sem apagar ou reescrever valores antigos',()=>{
    const {dados}=iniciar();const bruto=JSON.parse(dados.get(chave));bruto.funcionarios[0].cpfFuncionario='DEMO-LEGADO-FUNC';bruto.fornecedores[0].cnpj='DEMO-LEGADO-FORN';bruto.clientes[0].cpfCliente='123';
    const original=JSON.stringify(bruto);dados.set(chave,original);const novo=new GerenciadorSistema();
    assert.equal(novo.getAvisoPersistencia(),null);assert.equal(novo.listarFuncionarios()[0].getCpfFuncionario(),'DEMO-LEGADO-FUNC');assert.equal(novo.listarClientes()[0].getCpfCliente(),'123');
    assert.equal(dados.get(chave),original);assert.equal(novo.listarVendas().length,1);
});

test('falha de gravação informa memória não salva e preserva último JSON válido',()=>{
    const {s,dados,storage}=iniciar();const antes=dados.get(chave);const setter=storage.setItem;
    storage.setItem=()=>{throw new Error('Quota simulada');};s.cadastrarCategoria('Sem salvar');
    assert.match(s.getAvisoPersistencia(),/Não foi possível salvar/);assert.equal(dados.get(chave),antes);
    storage.setItem=setter;assert.equal(new GerenciadorSistema().listarCategorias().length,4);
    s.cadastrarCategoria('Salvar novamente');assert.equal(s.getAvisoPersistencia(),null);
    assert.equal(new GerenciadorSistema().listarCategorias().length,6);
});

test('JSON inválido ou referência quebrada não é sobrescrito até reset explícito com backup',()=>{
    for(const tipo of ['json','referencia']){
        const {dados}=iniciar();const bruto=JSON.parse(dados.get(chave));bruto.produtos[0].idCategoria=999;
        const original=tipo==='json'?'{INVALIDO':JSON.stringify(bruto);dados.set(chave,original);
        const novo=new GerenciadorSistema();assert.match(novo.getAvisoPersistencia(),/original foi preservado/);assert.equal(dados.get(chave),original);
        novo.definirFuncionarioAtivo(1);novo.cadastrarCategoria('Em memória');assert.equal(dados.get(chave),original);
        novo.resetarDadosParaPadrao();assert.equal(novo.getAvisoPersistencia(),null);
        assert.ok([...dados].some(([k,v])=>k.startsWith(chave+'_recuperacao_')&&v===original));assert.doesNotThrow(()=>JSON.parse(dados.get(chave)));
    }
});

test('reset de dados inválidos não apaga original quando backup falha',()=>{
    const {dados,storage}=iniciar();dados.set(chave,'{INVALIDO');const novo=new GerenciadorSistema();storage.setItem=()=>{throw new Error('Sem espaço');};
    assert.throws(()=>novo.resetarDadosParaPadrao());assert.equal(dados.get(chave),'{INVALIDO');assert.match(novo.getAvisoPersistencia(),/original foi preservado/);
});

test('conflito entre instâncias é bloqueado antes de mutação ou sobrescrita',()=>{
    const {s:a,dados}=iniciar();const b=new GerenciadorSistema();a.cadastrarCategoria('Da aba A');const antes=dados.get(chave);
    assert.throws(()=>b.cadastrarCategoria('Da aba B'),/Conflito/);assert.match(b.getAvisoPersistencia(),/outra aba/);
    assert.equal(b.listarCategorias().length,4);assert.equal(dados.get(chave),antes);
    const c=new GerenciadorSistema();assert.ok(c.listarCategorias().some(x=>x.getNomeCategoria()==='Da aba A'));assert.equal(c.listarCategorias().length,5);
});
