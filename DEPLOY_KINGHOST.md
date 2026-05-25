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

Crie:

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_PROTOCOL
FTP_SERVER_DIR
```

Exemplo:

```text
FTP_SERVER=ftp.web-ded-180026a.kinghost.net
FTP_USERNAME=velvetmotors
FTP_PASSWORD=senha_ftp_no_secret
FTP_PROTOCOL=ftp
FTP_SERVER_DIR=/
```

Tambem existe o host `ftp.velvetmotors.com.br`, mas neste primeiro momento use o host alternativo:

```text
ftp.web-ded-180026a.kinghost.net
```

O caminho fisico informado pela KingHost e:

```text
D:\web\localuser\velvetmotors
```

Normalmente o FTP ja abre na raiz correspondente a esse caminho. Por isso, comece com:

```text
FTP_SERVER_DIR=/
```

Se o deploy subir os arquivos para uma pasta errada ou o site nao abrir, ajuste para o diretorio publico indicado no painel da KingHost.

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
