// Somente para testes. As bases são sequências artificiais, sem associação a cadastros.
export function cpfSintetico(sequencia = 1) {
    let valor = String(sequencia).padStart(9, "0");
    for (const pesoInicial of [10, 11]) {
        const soma = Array.from(valor).reduce((total, algarismo, index) => total + Number(algarismo) * (pesoInicial - index), 0);
        const resto = soma % 11;
        valor += resto < 2 ? 0 : 11 - resto;
    }
    return valor;
}
export function cnpjSintetico(sequencia = 1) {
    let valor = String(sequencia).padStart(8, "0") + "0001";
    for (const pesoInicial of [5, 6]) {
        const soma = Array.from(valor).reduce((total, algarismo, index) => {
            const peso = ((pesoInicial - index + 6) % 8 + 8) % 8 + 2;
            return total + Number(algarismo) * peso;
        }, 0);
        const resto = soma % 11;
        valor += resto < 2 ? 0 : 11 - resto;
    }
    return valor;
}
