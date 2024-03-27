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
        choices: ['Validar URL/SUBDOMAINS', 'Sair'],
      },
    ])
    .then((answer) => {
      const action = answer['action'];
      if (action === 'Validar URL/SUBDOMAINS') {
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

          const responseObj = {
            url,
            statusCode: statusCode.status(),
            screenshotPath: `../${screenshotPath}`,
          };

          responses.all.push(responseObj);
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
            console.log(chalk.bgGreen.black(`[${statusCode.status()}] ${url}`));
          }
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
        exec(`kill-port ${port}`, (error, stdout, stderr) => {
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
          console.log(`Processos na porta ${port} encerrados com sucesso.`);
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
        chalk.bgGreen.white(
          'WEBSERVER ONLINE! ABRA O ARQUIVO INDEX.HTML EM ./html/index.html  🚀',
        ),
      );
    })
    .catch((error) => console.log(error));
};
