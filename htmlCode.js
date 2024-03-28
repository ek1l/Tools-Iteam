let htmlCode = `<!DOCTYPE html>
<html lang="pt-BR">

<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Red Team Tools - OSINT</title>
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
               padding: 25px
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
               color: black;
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

          h1 {
               color: black;
          }

          .container_single_response {
               display: flex;
               align-items: center;
               justify-content: center;
               width: 100%;
               height: 100%;
               flex-direction: row-reverse;
               gap: 20px;
          }

          .container_single_response_img {
               width: 1000px;
               height: 700px;
               object-fit: cover;
               border-radius: 10px;
               opacity: 0.9;
               transition: 0.3s;
          }

          .container_single_response_img:hover {
               opacity: 1;
          }

          .container_wayback,
          .container_wayback_all,
          .container_brute_force_success,
          .container_brute_force_error {
               width: 1000px;
               height: 500px;
               overflow: scroll;
               display: flex;
               align-items: flex-start;
               justify-content: flex-start;
               flex-direction: column;
               border: 10px solid black;
               padding: 10px;
               border-radius: 10px;
               gap: 20px;
          }

          .container_waybackLado {
               display: flex;
               align-items: center;
               justify-content: center;
               flex-direction: row-reverse;
               width: 100%;
               gap: 50px;
          }
     </style>
</head>

<body>
     <div class="titleAndLogo">
          <a href="./index.html"><img src="https://it-eam.com/wp-content/uploads/2016/12/Logo-iT.eam_.png" alt="Logo Iteam"></a>
          <h1 class="red-team">RED TEAM TOOLS</h1>
          <h1 class="url_subdomains_title">OSINT</h1>
     </div>
     <div id="root"></div>
     <script>
          const root = document.getElementById('root');

          const requestServer = async () => {
               const response = await fetch('http://localhost:3000/all');
               try {
                    const data = await response.json();
                    data.forEach((item, index) => {
                         const div = document.createElement('div');
                         div.classList.add('container__response');
                         div.setAttribute('data-index', index);
                         div.innerHTML = '\\
                         <img data-index="' + index + '" src="' + item.screenshotPath + '" alt="Screenshot">\\
                         <div data-index="' + index + '" class="container__response__text">\\
                              <a data-index="' + index + '" target="_blank" href="' + item.url + '">' + item.url + '</a>\\
                              <h1 data-index="' + index + '">[' + item.statusCode + ']</h1>\\
                         </div>\\
                    ';
                         div.addEventListener('click', (event) => {
                              const index = event.target.getAttribute('data-index');
                              root.innerHTML = '';
                              root.innerHTML = '\\
                              <img class="container_single_response_img" src="' + data[index].screenshotPath + '" alt="Screenshot">\\
                              <div class="container_single_response">\\
                              <a target="_blank" href="' + data[index].url + '">' + data[index].url + '</a>\\
                              <h1 class="url_subdomains_title">[' + data[index].statusCode + ']</h1>\\
                              </div>\\
                              <div class="container_waybackLado">\\
                              <div class="card_wayback">\\
                                   <h1>WAYBACK LINKS ERROR</h1>\\
                                   <div class="container_wayback_all"></div>\\
                              </div>\\
                              <div class="card_wayback">\\
                                   <h1>Wayback LINKS SUCCESS</h1>\\
                                   <div class="container_wayback"></div>\\
                              </div>\\
                              </div>\\
                              <div class="container_waybackLado">\\
                              <div class="card_wayback">\\
                                   <h1>BRUTE FORCE LINKS ERROR</h1>\\
                                   <div class="container_brute_force_error"></div>\\
                              </div>\\
                              <div class="card_wayback">\\
                                   <h1>BRUTE FORCE LINKS SUCCESS</h1>\\
                                   <div class="container_brute_force_success"></div>\\
                              </div>\\
                              </div>\\
                              ';
                              data[index].waybackResponses.forEach((url) => {
                                   const containerWayback = document.querySelector('.container_wayback');
                                   containerWayback.innerHTML += '\\
                              <a target="_blank" href="' + url + '">' + url + '</a>\\
                              ';
                              });

                              data[index].errorLinks.forEach((url) => {
                                   const containerWayback = document.querySelector('.container_wayback_all');
                                   containerWayback.innerHTML += '\\
                              <a target="_blank" href="' + url + '">' + url + '</a>\\
                              ';
                              });

                              data[index].bruteForceSuccess.forEach((url) => {
                                   const containerBruteForceSuccess = document.querySelector('.container_brute_force_success');
                                   containerBruteForceSuccess.innerHTML += '\\
                                        <a target="_blank" href="' + url + '">' + url + '</a>\\
                                        ';
                              });
                              data[index].bruteForceFail.forEach((url) => {
                                   const containerBruteForceError = document.querySelector('.container_brute_force_error');
                                   containerBruteForceError.innerHTML += '\\
                                        <a target="_blank" href="' + url + '">' + url + '</a>\\
                                        ';
                              });
                         });
                         root.appendChild(div);
                    });
               } catch (error) {
                    console.log(error);
               }
          };

          requestServer();

     </script>
</body>

</html>`;

module.exports = htmlCode;
