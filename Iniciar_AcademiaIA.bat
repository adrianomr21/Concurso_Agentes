@echo off
:: Altera o diretório para a pasta onde o arquivo .bat está localizado
cd /d "%~dp0"
title AcademiaIA - Servidor Local
echo =======================================================
echo         INICIANDO SERVIDOR LOCAL DA ACADEMIAIA         
echo =======================================================
echo.
echo [1/2] Iniciando o servidor de agentes (npm run web)...
:: Executa npm run web de forma minimizada para não atrapalhar o usuário
start "AcademiaIA Server" /min cmd /c "npm run web"
echo [2/2] Aguardando o servidor inicializar...
timeout /t 3 /nobreak >nul
echo [3/3] Abrindo a interface no navegador...
start http://localhost:3000
echo.
echo === TUDO PRONTO! ===
echo O servidor esta rodando em segundo plano.
echo Para fechar o servidor, feche a janela minimizada do terminal "AcademiaIA Server".
echo.
timeout /t 5 >nul
exit
