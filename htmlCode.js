let htmlCode = `<!DOCTYPE html>
<html lang="pt-BR">

<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>It.eam Tools - URL/SUBDOMAINS VALIDATOR</title>
     <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

          * {
               margin: 0;
               padding: 0;
               box-sizing: border-box;
               text-decoration: none;
               list-style: none;
               font-family: 'Roboto', sans-serif;
          }

          body {
               min-height: 100vh;
               width: 100%;
               display: flex;
               align-items: center;
               justify-content: flex-start;
               background: white;
               color: white;
               flex-direction: column;
               gap: 70px;
          }

          img {
               max-width: 100%;
          }

          .titleAndLogo {
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               gap: 20px;

          }

          .titleAndLogo img {
               width: 500px;
          }

          .titleAndLogo h1 {
               font-size: 50px;
          }

          .red-team {
               color: #c4161c;
          }

          #root {
               width: 100%;
               display: flex;
               justify-content: center;
               align-items: center;
               flex-wrap: wrap;
               gap: 50px;
          }

          .container__response {
               width: 500px;
               height: 100%;
               background: #c4161c;
               border-radius: 20px;
               padding: 10px;
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               gap: 20px;
          }

          .container__response h1,
          a {
               color: white;
               font-size: 20px;
               font-weight: 500;
               transition: 0.3s;
          }

          .container__response a:hover {
               color: rgb(153, 150, 150);
          }

          .container__response img {
               opacity: 0.9;
               transition: 0.3s;
               width: 100%;
               height: 200px;
               object-fit: cover;
               border-radius: 20px;
          }

          .container__response img:hover {
               opacity: 1;
          }

          .container__response__text {
               width: 100%;
               display: flex;
               align-items: center;
               justify-content: center;
               flex-direction: row-reverse;
               gap: 20px;
          }
          .url_subdomains_title {
               color: black;
               font-weight: 700;
          }
     </style>
</head>

<body>
     <div class="titleAndLogo">
          <img src="https://it-eam.com/wp-content/uploads/2016/12/Logo-iT.eam_.png" alt="Logo Iteam">
          <h1 class="red-team">RED TEAM TOOLS</h1>
          <h1 class="url_subdomains_title">URL / SUBDOMAINS VALIDATOR</h1>
     </div>
     <div id="root"></div>
     <script>
          const data = ${JSON.stringify(require('./html/response.json'))};

          const root = document.getElementById('root');

          data.forEach(item => {
               const div = document.createElement('div');
               div.classList.add('container__response');
               div.innerHTML = \`
               <img src="\${item.screenshotPath}" alt="Screenshot">
               <div class="container__response__text">
                    <a href="\${item.url}">\${item.url}</a>
                    <h1>[\${item.statusCode}]</h1>
               </div>
               \`;
               div.addEventListener('click', () => {
                    root.innerHTML = '';
               });
               root.appendChild(div);
          });
     </script>
</body>
</html>`;

module.exports = htmlCode;