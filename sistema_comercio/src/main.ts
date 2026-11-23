import { GerenciadorSistema } from "./servicos/GerenciadorSistema.js";
import { ControladorInterface } from "./ui/ControladorInterface.js";

function iniciarAplicacao(): void {
    const sistema = new GerenciadorSistema(true);
    const controlador = new ControladorInterface(sistema);
    controlador.inicializar();
}

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarAplicacao);
    } else {
        iniciarAplicacao();
    }
}
