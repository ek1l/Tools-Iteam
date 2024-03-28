## Screenshots

![App Screenshot](https://i.imgur.com/UuTS6Tl.png)

![App Screenshot](https://i.imgur.com/hgtNPS9.png)

# It.eam Tools - Red Team

Desenvolvi uma aplicação para automatizar e agilizar o processo de OSINT (Open-Source Intelligence). Essa ferramenta é capaz de realizar uma série de tarefas automaticamente. Primeiramente, ela acessa o Wayback Machine e busca todas as URLs relacionadas ao site fornecido. Em seguida, valida cada uma dessas URLs, oferecendo a opção de realizar enumeração de DNS e brute force de diretórios, conforme necessário.

Além disso, a aplicação utiliza a API do WHOIS para coletar todos os dados relacionados aos domínios encontrados. Uma vez concluído o processo, a aplicação sobe um servidor web local na porta 3000 e gera um arquivo index.html, permitindo que o usuário acesse facilmente todas as informações detalhadas através do navegador.

Essa ferramenta é uma solução abrangente para a obtenção e organização de informações relevantes durante investigações de OSINT, oferecendo uma interface simples e eficiente para análise detalhada.

## Tecnologias

- NodeJS
- chalk
- child_process
- inquirer
- json-server
- puppeteer
- HTML5
- CSS3
- Javascript

## Como baixar a ferramenta

- Clone o repositório: https://github.com/ek1l/Tools-Iteam.git

```bash
  cd Tools-Iteam
  npm install
  node index.js
```

## Brute force e DNS enumerate

- Se você for fazer enumeração de DNS crie um arquivo "subdomain.txt" na raiz do proejto.
- Se você for fazer brute force em diretórios crie um arquivo "wl.txt" na raiz do projeto.

## Desenvolvedor

- [@ek1l](https://www.github.com/ek1l)

## Tester

- [@ELIZEUOPAIN](https://github.com/ELIZEUOPAIN)
