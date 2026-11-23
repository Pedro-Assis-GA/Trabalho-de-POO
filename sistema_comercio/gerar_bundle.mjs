import fs from "fs";
import path from "path";

const distDir = path.resolve("dist");
const arquivosOrdem = [
    path.join(distDir, "modelos", "Entidades.js"),
    path.join(distDir, "modelos", "EstoqueECompras.js"),
    path.join(distDir, "modelos", "CaixaEVendas.js"),
    path.join(distDir, "servicos", "GerenciadorSistema.js"),
    path.join(distDir, "ui", "ControladorInterface.js"),
    path.join(distDir, "main.js")
];

let conteudoFinal = "// Bundle gerado automaticamente a partir do código TypeScript (POO)\n(() => {\n";

for (const arquivo of arquivosOrdem) {
    let codigo = fs.readFileSync(arquivo, "utf-8");
    // Remove linhas de import ES Module e palavras-chave export para rodar direto no navegador (inclusive via file://)
    codigo = codigo.replace(/^import\s+[\s\S]*?from\s+["'].*?["'];?\s*$/gm, "");
    codigo = codigo.replace(/^export\s+/gm, "");
    conteudoFinal += `\n// --- ${path.basename(arquivo)} ---\n` + codigo + "\n";
}

conteudoFinal += "\n})();\n";

fs.writeFileSync(path.join(distDir, "app.bundle.js"), conteudoFinal, "utf-8");
console.log("Bundle dist/app.bundle.js gerado com sucesso!");
