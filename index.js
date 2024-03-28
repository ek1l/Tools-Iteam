const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const htmlCode = require('./htmlCode.js');
const { exec } = require('child_process');
console.log(`  ___  _                                                                                                     
|_ _|| |_     ___   __ _  _ __ ___                                                                          
 | | | __|   / _ \\ / _\` || '_ \` _ \\                                                                         
 | | | |_  _|  __/| (_| || | | | | |                                                                        
|___| \\__|(_)\___| \\__,_||_| |_| |_|                                                                        
 ____   _____  ____    _____  _____     _     __  __   _____  ___    ___   _      ____                      
|  _ \\ | ____||  _ \\  |_   _|| ____|   / \\   |  \\/  | |_   _|/ _ \\  / _ \\ | |    / ___|                     
| |_) ||  _|  | | | |   | |  |  _|    / _ \\  | |\\/| |   | | | | | || | | || |    \\___ \\                     
|  _ < | |___ | |_| |   | |  | |___  / ___ \\ | |  | |   | | | |_| || |_| || |___  ___) |                    
|_| \\_\\|_____||____/    |_|  |_____|/_/   \\_\\|_|  |_|   |_|  \\___/  \\___/ |_____||____/                     
`);

const operation = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: ['OSINT', 'Sair'],
      },
    ])
    .then((answer) => {
      const action = answer['action'];
      if (action === 'OSINT') {
        urlAndSubDomainsValidator();
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Saindo...'));
        process.exit();
      }
    })
    .catch((error) => console.log(error));
};

operation();

const urlAndSubDomainsValidator = () => {
  console.log(chalk.bgGreen.black('Loading...'));

  WriteUrlAndSubdomains();
};

const WriteUrlAndSubdomains = async () => {
  inquirer
    .prompt([
      {
        name: 'txtFile',
        message: 'Digite o nome do arquivo TXT:',
      },
    ])
    .then(async (answer) => {
      const txtFile = answer['txtFile'];
      if (!txtFile) {
        console.log(
          chalk.bgRed.black('O nome do arquivo TXT não pode ser vazio.'),
        );
        console.log(chalk.bgRed.black('Caso queira voltar digite back.'));

        WriteUrlAndSubdomains();
        return;
      }

      if (txtFile === 'back') {
        operation();
        return;
      }

      if (!fs.existsSync(`./${txtFile}.txt`)) {
        console.log(chalk.bgRed.black('O arquivo não existe.'));
        console.log(chalk.bgRed.black('Caso queira voltar digite back.'));
        WriteUrlAndSubdomains();
        return;
      }

      const txtFileContent = fs.readFileSync(`./${txtFile}.txt`, {
        encoding: 'utf8',
        flag: 'r',
      });

      if (txtFileContent.length < 1) {
        console.log(chalk.bgRed.black('O arquivo não possui conteúdo.'));
        console.log(chalk.bgRed.black('Caso queira voltar digite back.'));
        WriteUrlAndSubdomains();
        return;
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const screenshotDir = `./screenshots`;
      const responseDir = './response';
      const htmlDir = './html';
      const jsonResponseHTML = 'db.json';
      const wordlist = './wl.txt';
      const urls = txtFileContent
        .split('\n')
        .filter((url) => url.trim() !== '');

      if (fs.existsSync(screenshotDir)) {
        fs.rmSync(screenshotDir, { recursive: true });
      }

      if (fs.existsSync(responseDir)) {
        fs.rmSync(responseDir, { recursive: true });
      }

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
      }

      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir);
      }
      const responses = {
        all: [],
      };

      for (let url of urls) {
        try {
          const statusCode = await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 15000,
          });
          if (
            statusCode.status() === 200 ||
            statusCode.status() === 301 ||
            statusCode.status() === 302 ||
            statusCode.status() === 303 ||
            statusCode.status() === 307 ||
            statusCode.status() === 308 ||
            statusCode.status() === 403 ||
            statusCode.status() === 401 ||
            statusCode.status() === 405
          ) {
            console.log(
              chalk.bgYellowBright.black(`[${statusCode.status()}] ${url}`),
            );
          }
          const screenshotFileName = `${url
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()}.png`;
          const screenshotPath = path
            .join(screenshotDir, screenshotFileName)
            .replace(/\\/g, '/');

          await page.screenshot({
            path: screenshotPath,
          });
          const response = await page.evaluate(
            () => document.documentElement.outerHTML,
          );

          fs.writeFileSync(
            path.join(
              responseDir,
              `${url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`,
            ),
            JSON.stringify(response),
          );

          const waybackResponse = async (url) => {
            try {
              let urlHost = `https://web.archive.org/web/timemap/json?url=https%3A%2F%2F${url}&matchType=prefix&collapse=urlkey&output=json&fl=original%2Cmimetype%2Ctimestamp%2Cendtimestamp%2Cgroupcount%2Cuniqcount&filter=!statuscode%3A%5B45%5D..&limit=10000&_=1711579879466`;
              const response = await fetch(urlHost);
              const data = await response.json();
              return data.slice(1).map((entry) => entry[0]);
            } catch (error) {
              console.log('Erro ao buscar dados na API Wayback', error);
              return [];
            }
          };

          let waybackResponses = await waybackResponse(url);

          const validatedUrls = [];
          const errorLinksArray = [];
          console.log(
            chalk.bgYellow.black.bold(`Validando URLs WAYBACK... ${url}`),
          );
          for (const waybackUrl of waybackResponses) {
            try {
              const waybackResponse = await fetch(waybackUrl);
              if (
                waybackResponse.status === 200 ||
                waybackResponse.status === 301 ||
                waybackResponse.status === 302 ||
                waybackResponse.status === 303 ||
                waybackResponse.status === 307 ||
                waybackResponse.status === 308 ||
                waybackResponse.status === 202
              ) {
                validatedUrls.push(waybackUrl);
              } else {
                errorLinksArray.push(waybackUrl);
              }
            } catch (error) {
              console.error('Erro ao validar URL WAYBACK:', waybackUrl, error);
            }
          }
          console.log(
            chalk.bgYellow.black.bold(`COMEÇANDO BRUTE FORCE... ${url}`),
          );
          const bruteForceSuccess = [];
          const bruteForceFail = [];
          if (fs.existsSync(wordlist)) {
            const wordlistContent = fs
              .readFileSync(wordlist, 'utf8')
              .split('\r\n')
              .filter((url) => url.trim() !== '');
            for (const word of wordlistContent) {
              const urlWithWord = `${url}/${word}`;
              try {
                const response = await fetch(urlWithWord);
                if (
                  response.status === 200 ||
                  response.status === 301 ||
                  response.status === 302 ||
                  response.status === 303 ||
                  response.status === 307 ||
                  response.status === 308
                ) {
                  bruteForceSuccess.push(urlWithWord);
                } else {
                  bruteForceFail.push(urlWithWord);
                }
              } catch (error) {
                console.log(error);
              }
            }
          } else {
            console.log(chalk.bgRed.black(`[ERRO] CRIE UM ARQUIVO wl.txt`));
            return;
          }

          const responseObj = {
            url,
            statusCode: statusCode.status(),
            screenshotPath: `../${screenshotPath}`,
            waybackResponses: validatedUrls,
            errorLinks: errorLinksArray,
            bruteForceSuccess,
            bruteForceFail,
          };
          responses.all.push(responseObj);
        } catch (error) {
          console.log(chalk.bgRed.black(`[ERRO] ${url}`));
        }
      }

      if (fs.existsSync(htmlDir)) {
        fs.rmSync(htmlDir, { recursive: true });
      }

      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir);
      }

      fs.writeFileSync(jsonResponseHTML, JSON.stringify(responses));

      fs.writeFileSync(path.join(htmlDir, 'index.html'), ` ${htmlCode}`);
      await browser.close();

      const killPort = (port) => {
        exec(`kill-port ${port}`, (error, _, stderr) => {
          if (error) {
            console.error(
              `Erro ao encerrar processos na porta ${port}: ${error.message}`,
            );
            return;
          }
          if (stderr) {
            console.error(
              `Erro ao encerrar processos na porta ${port}: ${stderr}`,
            );
            return;
          }
          console.log(
            `Processos na porta ${port} encerrados com sucesso.\r\n SERVIDOR ABERTO EM http://localhost:${port}
            ${chalk.bgYellow.black(
              'SE O SERVIDOR CAIR  OU  O TERMINAL FOR FECHADO ENTRE NESTE MESMO DIRETORIO E DIGITE "npm run server"',
            )}
            `,
          );
        });
      };

      const porta = 3000;
      killPort(porta);

      const subirServer = (comando) => {
        exec(comando, (error, stdout, stderr) => {
          if (error) {
            console.error(`Erro : ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Erro : ${stderr}`);
            return;
          }
          console.log({ stdout });
        });
      };

      const subirServerComando = 'npm run server';
      subirServer(subirServerComando);

      console.log(
        chalk.bgBlack.white(
          'WEBSERVER ONLINE! ABRA O ARQUIVO INDEX.HTML EM ./html/index.html PARA CONFERIR OS DETALHES DA BUSCA 🚀',
        ),
      );
    })
    .catch((error) => console.log(error));
};
