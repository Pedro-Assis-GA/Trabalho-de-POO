import { ModuloSistema } from '../dist/modelos/Entidades.js';

// Os testes antigos de negócio exercitam módulos além do caixa. Prepare o
// funcionário da sessão sem contornar os novos controles nem remover asserções.
export function prepararOperadorCompleto(s) {
    if (!s.listarFuncionarios().length) return s;
    const ativo = s.getFuncionarioLogado()?.getIdFuncionario();
    s.definirFuncionarioAtivo(1);
    for (const modulo of [ModuloSistema.ESTOQUE, ModuloSistema.COMPRAS, ModuloSistema.EQUIPE]) {
        if (!s.buscarFuncionarioPorId(2).temAcessoModulo(modulo)) s.alterarAutorizacao(2, modulo, true, 'Preparação da regressão de regras existentes');
    }
    if (ativo !== undefined) s.definirFuncionarioAtivo(ativo);
    return s;
}
