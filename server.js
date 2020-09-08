// Implementação BotCoronaBrasil 

console.log('==== #Bot Starting... ====')

// Declarando palavra desejada
const filtroPesquisa = 'dados covid Brasil'

// Import dependencies
const Twit = require('twitter')
const axios = require('axios')
require('dotenv').config()

// Configurando API Twitter
const Tweet = new Twit({
  consumer_key: process.env.BOT_CONSUMER_KEY,
  consumer_secret: process.env.BOT_CONSUMER_SECRET,
  access_token_key: process.env.BOT_ACCESS_TOKEN,
  access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
})

// Funções Globais
function formatarValor(valor) {
  return valor.toLocaleString('pt-BR');
}
function formatarData(valor) {
  var today = new Date(valor);
  // -3 (utc to gmt 3) Horario Greenwich para Brasilia
  today.setHours(today.getHours() - 3 )

  var day = today.getDate() + "";
  var month = (today.getMonth() + 1) + "";
  var year = today.getFullYear() + "";
  var hour = today.getHours() + "";
  var minutes = today.getMinutes() + "";
  var seconds = today.getSeconds() + "";
  
  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);
  return (day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds);
  
  function checkZero(data){
    if(data.length == 1){
      data = "0" + data;
    }
    return data;
  }
}

// API Twitter
function retweet(event) {
  const { retweeted_status, id_str, is_quote_status,location } = event
  const { screen_name } = event.user;
  if (location !== null && !retweeted_status && !is_quote_status) {
    //Post Retweet
    Tweet.post('statuses/retweet/' + id_str, err => {
      if (err) {
        return console.log("Erro no rt: " + err)
      }
      console.log('RETWEETADO: ', `https://twitter.com/${screen_name}/status/` + id_str)
    })
    //Post Like
    Tweet.post('favorites/create', {id: id_str}, err => {
      if (err){
        return console.log("Erro no like: " + err[0].message)
      }
      return console.log("LIKE: " + `https:twitter.com/${screen_name}/status/${id_str}`)
    })
    //Request API Covid
    axios.get('https://covid19-brazil-api.now.sh/api/report/v1/brazil')
    .then(function (response) {
      //Post Comentario / String.fromCodePoint (Emoji em Hexadecimal)
      Tweet.post('statuses/update', { in_reply_to_status_id: id_str, status: 'Olá @' + screen_name +
      ' '+ 'Dados Covid-19 '+ String.fromCodePoint(0x0001F1E7)+String.fromCodePoint(0x0001F1F7) +
      ' \n\n'+String.fromCodePoint(0x0001F4C8)+' '+formatarValor(response.data.data.confirmed)+ ' casos confirmados.' +
      '\n'+ String.fromCodePoint(0x0001F480)+' '+ formatarValor(response.data.data.deaths)+' mortes.'+'\n'+ String.fromCodePoint(0x0001F691)+' '+ formatarValor(response.data.data.recovered)+' recuperadas.'+
      '\n'+ String.fromCodePoint(0x0001F557)+' '+ formatarData(response.data.data.updated_at)+' ultima atualização.'+ '\n\nMais informação: covid.saude.gov.br' +'\n#FiqueEmCasa' }, err => {
        if (err) {
          return console.log("Erro no comentario : " + err)
        }
        return console.log("COMENTADO: " + `https:twitter.com/${screen_name}/status/${id_str}`)
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  } else {
    return
  }
}

var stream = Tweet.stream('statuses/filter', { track: filtroPesquisa })
stream.on('data', retweet)
stream.on('error', err => console.log("Erro > " + err))


