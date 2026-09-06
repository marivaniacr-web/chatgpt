# CPF Ajuste

Aplicativo desktop local para validar um CPF digitado e sugerir correções de um único caractere quando a sequência não passa nos dígitos verificadores. Ele não consulta bases externas, não confirma titularidade e não deve ser usado para criar ou assumir identidades.

Também há uma consulta opcional por **nome completo**: ela abre uma pesquisa exata no Google no navegador padrão, para que a pessoa usuária consulte fontes que já sejam públicas. Para proteger dados pessoais, o aplicativo não faz pesquisa por CPF, não indexa resultados e não envia o CPF informado para nenhum serviço externo.

## Executar durante o desenvolvimento

```bash
npm install
npm run desktop
```

> Se o aplicativo foi gerado antes desta correção e abriu em branco, execute novamente `npm run dist:win` e instale o novo `.exe`. O Electron abre a versão compilada em `dist/`, por isso os arquivos precisam ser gerados novamente.

## Gerar o instalador Windows

Em uma máquina Windows (ou ambiente de CI Windows), execute:

```bash
npm install
npm run dist:win
```

O `electron-builder` produzirá um instalador NSIS `.exe` na pasta `release/`. O assistente permite escolher o diretório de instalação.

O instalador não é assinado com certificado de código. Por isso, o Windows pode mostrar um aviso do SmartScreen ao executá-lo; publique somente por um canal confiável e, para distribuição pública, use um certificado de assinatura de código.

## Verificar a lógica

```bash
npm test
```

## Funcionamento da correção

* Para nove dígitos, calcula os dois dígitos verificadores faltantes.
* Para onze dígitos inválidos, recalcula os dois dígitos verificadores e também testa uma troca por vez nos nove primeiros algarismos, preservando os verificadores informados; sequências repetidas são rejeitadas.
* Uma troca em um algarismo pode gerar mais de uma possibilidade matemática. A ferramenta sempre exibe isso como sugestão, não como confirmação de identidade. Sempre confirme o número com a pessoa titular ou documento autorizado antes de usá-lo.
* A consulta pública é limitada ao nome completo informado conscientemente pela pessoa usuária; o app não executa buscas por CPF.
