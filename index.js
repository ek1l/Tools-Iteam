const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

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

      const urls = txtFileContent.split('\n');
      const screenshotDir = `./screenshots`;

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
      }

      const responseDir = './response';
      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir);
      }

      for (let url of urls) {
        try {
          await page.goto(url);
          await page.screenshot({
            path: `screenshots/${url
              .replace(/[^a-z0-9]/gi, '_')
              .toLowerCase()}.png`,
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
        } catch (error) {
          console.log(
            chalk.bgRed.black('Ocorreu um erro ao acessar a URL: ', url),
          );
        }
      }
      await browser.close();
      console.log(
        chalk.bgGreen.black('Todos os arquivos foram criados com sucesso!'),
      );
      operation();
    })
    .catch((error) => console.log(error));
};

 
