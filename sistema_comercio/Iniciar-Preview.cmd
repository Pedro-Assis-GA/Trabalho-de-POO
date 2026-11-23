@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js nao foi encontrado.
    echo Para testar sem instalar nada, abra index.html nesta pasta.
    pause
    exit /b 1
)
echo Gestao Comercial - preview local
echo Apos aparecer "Preview local", abra o endereco mostrado no navegador.
echo Mantenha esta janela aberta. Ctrl+C encerra o servidor.
node preview.mjs
if errorlevel 1 pause
