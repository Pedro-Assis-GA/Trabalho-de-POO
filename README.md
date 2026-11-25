# Trabalho de POO - Gestão Comercial

Sistema de demonstração para pequenos e médios comércios, com caixa, estoque,
compras, funcionários e rastreabilidade. Implementado em TypeScript com classes
de domínio e padrão Observer.

## Testar sem instalar dependências

Baixe o projeto pelo botão **Code > Download ZIP** do GitHub e extraia tudo.
Abra `sistema_comercio/index.html` em um navegador atualizado.
O JavaScript compilado já está incluído. No ZIP de preview distribuído ao grupo,
o `index.html` fica diretamente na pasta `Trabalho-de-POO-Preview`.

Consulte o [guia de testes do grupo](sistema_comercio/LEIA-ME.txt).
Cada navegador mantém seus próprios dados; os computadores não são sincronizados.
Use apenas dados fictícios. Para maior previsibilidade da persistência, prefira
o servidor local abaixo: o comportamento de `localStorage` em `file://` depende
do navegador.

## Servidor local opcional

Com Node.js instalado, abra um terminal na pasta extraída do projeto:

```powershell
cd sistema_comercio
node preview.mjs
```

No Windows, também é possível abrir `sistema_comercio/Iniciar-Preview.cmd`.
Acesse <http://127.0.0.1:4173>. Para encerrar, pressione `Ctrl+C` no terminal.
O endereço é local a cada computador; não é um link público para o grupo.

## Desenvolver e validar

Dentro de `sistema_comercio`:

```powershell
npm ci
npm test
npm run preview
```

Ambiente validado: Node.js 24.20.0 e TypeScript 6.0.3. `npm test` recompila e
executa as 22 asserções originais e 72 testes de regressão/regras de negócio. Após editar o TypeScript,
execute `npm run build` e recarregue a página.

## Escopo atual

Busca e filtros de produtos, persistência local e correções de integridade estão
implementados. SQL, API, login real, permissões gerais e operações complementares ainda
são pendências de produção. Veja o [diagnóstico completo](sistema_comercio/README.md).

Validade pode ser corrigida em **Estoque > Corrigir validade cadastrada**, com motivo
e histórico do responsável. Os alertas têm atalhos **Corrigir data** e **Dar baixa**.
A baixa exige confirmar a SAIDA; não altera a data. Correção cadastral não prolonga
a validade real, e produtos ainda vencidos continuam bloqueados para venda.

Cargos têm seleção explícita de módulos: **Caixa, Estoque, Compras e Equipe**.
Um gerente pode complementar o cargo em **Equipe > Autorizações por módulo**;
concessão/revogação têm motivo e histórico por módulo. A preview continua usando
seleção livre de identidade, sem autenticação real. Gerente possui todos os módulos;
colaboradores não acessam abas sem permissão. O PDV permite cadastrar caixas, manter
sessões simultâneas e escolher **Caixa desta venda**. Cada venda identifica caixa e operador.
Produto/fornecedor podem ser removidos das novas operações, preservando os históricos;
produto exige saldo zero. Com saldo zero, a validade aparece como **---**, sem apagar a data.

O diário técnico cumulativo é mantido separadamente da distribuição pública.
