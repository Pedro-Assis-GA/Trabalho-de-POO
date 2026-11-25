import { ControladorInterface } from '../dist/ui/ControladorInterface.js';

export function interfaceSimulada(s) {
    const elementos=new Map(), avisos=[];let confirmar=true;
    const el=id=>{
        if(!elementos.has(id)) {
            const classes=new Set();
            elementos.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,style:{},dataset:{},eventos:{},atributos:{},
                classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on){if(on===undefined)on=!classes.has(c);on?classes.add(c):classes.delete(c);}},
                addEventListener(t,fn){this.eventos[t]=fn;},setAttribute(k,v){this.atributos[k]=v;},
                querySelectorAll(){return [];},reset(){},focus(){},scrollIntoView(){},
                click(){if(!this.disabled)this.eventos.click?.({target:this});}
            });
        }
        return elementos.get(id);
    };
    const abas=['dashboard','pdv','estoque','compras','equipe'];
    const botoes=abas.map(a=>{const e=el('nav-'+a);e.dataset.tab=a;return e;});
    const secoes=abas.map(a=>el('tab-'+a));
    globalThis.document={getElementById:el,
        querySelector:q=>q.includes('data-tab="estoque"')?el('nav-estoque'):null,
        querySelectorAll:q=>q==='.nav-btn'?botoes:q==='.tab-section'?secoes:q==='input[name="cargo-permissoes"]:checked'?[]:[el(q.startsWith('#')&&!q.includes(' ')?q.slice(1):q)]};
    globalThis.window={confirm:()=>confirmar};
    const ui=new ControladorInterface(s);ui.exibirNotificacao=(...a)=>avisos.push(a);ui.inicializar();
    return {ui,el,avisos,botoes,secoes,confirmar(v){confirmar=v;},
        enviar:id=>el(id).eventos.submit({preventDefault(){}}),
        mudar:(id,value)=>{el(id).value=String(value);el(id).eventos.change?.();},
        destruir(){delete globalThis.document;delete globalThis.window;}};
}

export function alvoBotao(dataset) {
    return {closest(selector){
        if(selector.includes('data-remover-produto') && dataset.removerProduto!==undefined)return {dataset};
        if(selector.includes('data-remover-fornecedor') && dataset.removerFornecedor!==undefined)return {dataset};
        if(selector.includes('data-validade-acao') && dataset.validadeAcao!==undefined)return {dataset};
        return null;
    }};
}
