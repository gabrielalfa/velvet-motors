# Deploy Velvet Motors na KingHost

Este projeto publica apenas o Angular como site estatico. A API continua em:

```text
https://www.ictapi.com.br/Velvet/Home
```

## Pipeline

O workflow fica em:

```text
.github/workflows/deploy-kinghost.yml
```

Ele faz:

1. baixa o repositorio;
2. instala Node.js 24;
3. roda `npm ci`;
4. gera build de producao;
5. envia `src/VelvetMotors.Web/dist/VelvetMotors.Web/browser/` para a KingHost via FTP.

## Secrets do GitHub

No GitHub, acesse:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Crie somente:

```text
FTP_PASSWORD
```

A senha deve ficar no GitHub Secret. Os outros dados foram fixados no workflow para evitar erro de digitacao:

```text
FTP_SERVER=ftp.web-ded-180026a.kinghost.net
FTP_USERNAME=velvetmotors
FTP_PROTOCOL=ftp
FTP_SERVER_DIR=/www/
```

Tambem existe o host `ftp.velvetmotors.com.br`, mas neste primeiro momento use o host alternativo:

```text
ftp.web-ded-180026a.kinghost.net
```

O caminho fisico informado pela KingHost e:

```text
D:\web\localuser\velvetmotors
```

O FTP abre com as pastas `banco` e `www`. Por isso o deploy publica em:

```text
FTP_SERVER_DIR=/www/
```

Se o painel da KingHost indicar outro diretorio publico, ajuste `server-dir` no workflow.

## Quando publica

Publica automaticamente quando houver push na branch:

```text
main
master
production
```

Tambem da para publicar manualmente pelo GitHub em:

```text
Actions > Deploy KingHost > Run workflow
```

## Rotas Angular no IIS

O arquivo abaixo foi criado para permitir atualizar paginas como `/frota`, `/admin/login` e `/veiculo/1` sem erro 404:

```text
src/VelvetMotors.Web/public/web.config
```

Ele vai junto no build final.
