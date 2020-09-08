// Implementation of #100DaysOfCode Bot

console.log('==== #Bot Starting... ====')

// Import dependencies
const Twit = require('twitter')
const axios = require('axios')
const cidades = require('./cidades.json');

require('dotenv').config()

// Configuration
const Tweet = new Twit({
  consumer_key: process.env.BOT_CONSUMER_KEY,
  consumer_secret: process.env.BOT_CONSUMER_SECRET,
  access_token_key: process.env.BOT_ACCESS_TOKEN,
  access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
})
//console.log(Tweet)


// Funções Globais
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
}

function formatarValor(valor) {
  return valor.toLocaleString('pt-BR');
}
function formatarData(valor) {
  var today = new Date(valor);
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

// texto de pesquisa : 'covid brasil dados'
// API
function retweet(event) {
  console.log(event)
  const { retweeted_status, id_str, is_quote_status,location } = event
  const { screen_name } = event.user;
  if (location !== null && !retweeted_status && !is_quote_status) {
    console.log(id_str)
    Tweet.post('statuses/retweet/' + id_str, err => {
      if (err) {
        return console.log("Erro no rt: " + err)
      }
      console.log('RETWEETADO: ', `https://twitter.com/${screen_name}/status/` + id_str)
    })
    Tweet.post('favorites/create', {id: id_str}, err => {
      if (err){
        return console.log("Erro no like: " + err[0].message)
      }
      return console.log("LIKE: " + `https:twitter.com/${screen_name}/status/${id_str}`)
    })

    axios.get('https://covid19-brazil-api.now.sh/api/report/v1/brazil')
    .then(function (response) {

      Tweet.post('statuses/update', { in_reply_to_status_id: id_str, status: 'Olá @' + screen_name +
      ' '+ 'Dados Covid-19 '+ String.fromCodePoint(0x0001F1E7)+String.fromCodePoint(0x0001F1F7) +
      ' \n\n'+String.fromCodePoint(0x0001F4C8)+' '+formatarValor(response.data.data.confirmed)+ ' casos confirmados.' +
      '\n'+ String.fromCodePoint(0x0001F480)+' '+ formatarValor(response.data.data.deaths)+' mortes.'+'\n'+ String.fromCodePoint(0x0001F691)+' '+ formatarValor(response.data.data.recovered)+' recuperadas.'+
      '\n'+ String.fromCodePoint(0x0001F557)+' '+ formatarData(response.data.data.updated_at)+' ultima atualização.'+ '\n\nMais informação: covid.saude.gov.br' +'\n#FiqueEmCasa' }, err => {
        if (err) {
          return console.log("Erro no comentario: " + err)
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


  // padrex = ['123123123123','123123123'];
  // padrex.forEach(element => {
  //   console.log(element)
  //   var stream = Tweet.stream('statuses/filter', { track: "covid em "+ element})
  //   stream.on('data', retweet)
  //   stream.on('error', err => console.log("Erro > " + err))
  // });


var stream = Tweet.stream('statuses/filter', { track: "dados covid brasil" })
console.log("Brasil")
stream.on('data', retweet)
stream.on('error', err => console.log("Erro > " + err))


