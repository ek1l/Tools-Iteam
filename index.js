const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const htmlCode = require('./htmlCode.js');
const io = require('socket.io-client');
const { exec } = require('child_process');
const net = require('net');

console.log(
  chalk.black
    .red(`  ___  _                                                                                                     
|_ _|| |_     ___   __ _  _ __ ___                                                                          
 | | | __|   / _ \\ / _\` || '_ \` _ \\                                                                         
 | | | |_  _|  __/| (_| || | | | | |                                                                        
|___| \\__|(_)\___| \\__,_||_| |_| |_|                                                                        
 ____   _____  ____    _____  _____     _     __  __   _____  ___    ___   _      ____                      
|  _ \\ | ____||  _ \\  |_   _|| ____|   / \\   |  \\/  | |_   _|/ _ \\  / _ \\ | |    / ___|                     
| |_) ||  _|  | | | |   | |  |  _|    / _ \\  | |\\/| |   | | | | | || | | || |    \\___ \\                     
|  _ < | |___ | |_| |   | |  | |___  / ___ \\ | |  | |   | | | |_| || |_| || |___  ___) |                    
|_| \\_\\|_____||____/    |_|  |_____|/_/   \\_\\|_|  |_|   |_|  \\___/  \\___/ |_____||____/                     
`),
);

const operation = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
          'OSINT',
          'GeoIp / Virus Total',
          'Port Scanner',
          'Indentificar o tipo de hash',
          'Sair',
        ],
      },
    ])
    .then((answer) => {
      const action = answer['action'];
      if (action === 'OSINT') {
        urlAndSubDomainsValidator();
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Saindo...'));
        process.exit();
      } else if (action === 'GeoIp / Virus Total') {
        geoIp();
      } else if (action === 'Port Scanner') {
        portScanner();
      }else if(action === 'Indentificar o tipo de hash'){
        hashType();
      }
    })
    .catch((error) => console.log(error));
};

operation();
// OSINT
const urlAndSubDomainsValidator = () => {
  console.log(chalk.bgGreen.black('Loading...'));

  WriteUrlAndSubdomains();
};
// OSINT
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
      const dnsDir = './subdomain.txt';
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
              console.log(
                chalk.bgRed.black('Erro ao buscar dados na API Wayback'),
              );
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
              .split('\n')
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
            console.log(
              chalk.bgRed.black(
                `SE VOCÊ QUISER FAZER UM BRUTE FORCE CRIE UM ARQUIVO "wl.txt" NA RAIZ`,
              ),
            );
          }

          const dnsEnumSuccess = [];
          const dnsEnumFail = [];
          console.log(chalk.bgYellow.black.bold(`ENUMERANDO DNS... ${url}`));
          if (fs.existsSync(dnsDir)) {
            const wordlistContent = fs
              .readFileSync(dnsDir, 'utf8')
              .split('\n')
              .filter((word) => word.trim() !== '');

            for (const word of wordlistContent) {
              let urlCorreta;
              if (url.startsWith('https://')) {
                urlCorreta = url.replace('https://', '');
              } else if (url.startsWith('http://')) {
                urlCorreta = url.replace('http://', '');
              }
              const urlEnumDns = `http://${word.trim()}.${urlCorreta.trim()}`;
              try {
                const response = await fetch(urlEnumDns);
                if (
                  response.status === 200 ||
                  response.status === 301 ||
                  response.status === 302 ||
                  response.status === 303 ||
                  response.status === 307 ||
                  response.status === 308
                ) {
                  dnsEnumSuccess.push(urlEnumDns);
                } else {
                  dnsEnumFail.push(urlEnumDns);
                }
              } catch (error) {}
            }
          } else {
            console.log(
              chalk.bgRed.black(
                `SE VOCÊ QUISER FAZER UMA ENUMERAÇÃO DE DNS CRIE UM ARQUIVO "subdomain.txt" NA RAIZ`,
              ),
            );
          }
          const whoisResponse = async (url) => {
            try {
              let urlHost = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_za3WA10yeBOW3fws3cKKtqyC2FkgO&domainName=${url}&outputFormat=JSON`;
              const response = await fetch(urlHost);
              const data = await response.json();
              return data;
            } catch (error) {
              console.log(
                chalk.bgRed.black('Erro ao buscar dados na API Whois'),
              );
              return [];
            }
          };

          let whoisResponses = await whoisResponse(url);

          const responseObj = {
            url,
            statusCode: statusCode.status(),
            screenshotPath: `../${screenshotPath}`,
            waybackResponses: validatedUrls,
            errorLinks: errorLinksArray,
            bruteForceSuccess,
            bruteForceFail,
            dnsEnumSuccess,
            dnsEnumFail,
            whoisResponses: whoisResponses,
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
            ${chalk.bgYellow.black.bold(
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

// GEOIP
const geoIp = () => {
  console.log(chalk.bgGreen.black('Loading...'));
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'ip',
        message: 'IP: ',
      },
    ])
    .then(async (answer) => {
      let ip = answer['ip'];

      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();

      console.log(chalk.bgGreen.black(`[STATUS]: ${data.status}`));
      console.log(chalk.bgGreen.black(`[COUNTRY]: ${data.country}`));
      console.log(chalk.bgGreen.black(`[COUNTRYCODE]: ${data.countryCode}`));
      console.log(chalk.bgGreen.black(`[REGION_NAME]: ${data.regionName}`));
      console.log(chalk.bgGreen.black(`[CITY]: ${data.city}`));
      console.log(chalk.bgGreen.black(`[ZIP]: ${data.zip}`));
      console.log(chalk.bgGreen.black(`[LAT]: ${data.lat}`));
      console.log(chalk.bgGreen.black(`[TIMEZONE]: ${data.timezone}`));
      console.log(chalk.bgGreen.black(`[ISP]: ${data.isp}`));
      console.log(chalk.bgGreen.black(`[ORG]: ${data.org}`));
      console.log(chalk.bgGreen.black(`[AS]: ${data.as}`));
      console.log(chalk.bgGreen.black(`[QUERY]: ${data.query}`));

      console.log(chalk.bgYellow.black(`[VERIFICANDO IP NO VIRUSTOTAL]...`));

      const responseVirusTotal = await fetch(
        `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
        {
          headers: {
            Accept: 'application/json',
            'x-apikey':
              'a605511c3829b20dff2a13ef52bd6bfd64780a229e715f9bfd7bc8725143e843',
          },
        },
      );
      const dataVirusTotal = await responseVirusTotal.json();

      console.log(chalk.bgCyan.black(`[REPUTATION]:`));
      console.log(
        chalk.bgGreen.black(
          `[MALICIOUS]: ${dataVirusTotal.data.attributes.last_analysis_stats.malicious}`,
        ),
      );
      console.log(
        chalk.bgGreen.black(
          `[SUSPICIOUS]: ${dataVirusTotal.data.attributes.last_analysis_stats.suspicious}`,
        ),
      );
      console.log(
        chalk.bgGreen.black(
          `[UNDETECTED]: ${dataVirusTotal.data.attributes.last_analysis_stats.undetected}`,
        ),
      );
      console.log(
        chalk.bgGreen.black(
          `[HARMLESS]: ${dataVirusTotal.data.attributes.last_analysis_stats.harmless}`,
        ),
      );
      console.log(
        chalk.bgGreen.black(
          `[TIMEOUT]: ${dataVirusTotal.data.attributes.last_analysis_stats.timeout}`,
        ),
      );
      operation();
    })
    .catch((error) => console.log(error));
};
// PORTSCANNER
const portScanner = async () => {
  console.log(chalk.bgGreen.black('Loading...'));
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'ip',
      message: 'IP:',
    },
  ]);
  const ip = answer.ip;
  console.log(chalk.bgGreen.black(`Verificando 65535 portas...`));
  for (let i = 0; i < 65535; i++) {
    await checkPort(ip, i);
  }
};

const checkPort = (ip, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.on('connect', () => {
      console.log(chalk.bgGreen.black(`[PORTA]: ${port} Aberta`));
      socket.destroy();
      resolve();
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve();
    });

    socket.on('error', (err) => {
      resolve();
    });

    socket.connect(port, ip);
  });
};
//HASH IDENTIFIER
const hashType = () => {
  console.log(chalk.bgGreen.black('Loading...'));
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'hash',
        message: 'Hash: ',
      },
    ])
    .then((answer) => {
      const hash = answer['hash'];
      operation();
    })
    .catch((error) => console.log(error));
};