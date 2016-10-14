/**
 * Module dependencies.
 */

var express = require('express');
var syncRequest = require('sync-request');
var cheerio = require('cheerio');
var mysql = require('mysql');
var dateFormat = require('dateformat');
var cmd = require('node-cmd');

var app = express();
var port = 8080;

//Apertura del server
app.listen(port, function () {
 console.log('\nExpress server inizializzato sulla porta ' + port);
});

/** Comando per far partire il file sql della creazione del database e
    configurazione del db per l'utilizzo :
    - Da modificare utente e password! (ed opzionalmente il connectTimeout)
*/
cmd.run('mysql -u root -p < db.sql');

var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'dbarpa',
    connectTimeout: 300000
};

//Funzione che ritorna la data e ora corrente
var getDate = function() {

    var dateTime = new Date();
    var dateToday = (dateTime.getDate())+ "."+ (dateTime.getMonth()+1) + "."+dateTime.getFullYear();
    //L'1 indica il giorno prima di quello corrente
    var dateTime2 = dateTime - 1000 * 60 * 60 * 24 * 1;
    dateTime2 = new Date(dateTime2);

    var dateStarting = dateFormat(dateTime2, "dd.mm.yyyy");
    var dates = [dateStarting, dateToday];
    return dates;
};

//Lista delle sigle delle province dell'Emilia Romagna
var listProvince = ["PR", "RE", "PC", "MO", "BO", "FE", "RA", "FC", "RN"];
var inquinanti = [5,7,8,10];

var listProvince1 = ["PR", "RE", "PC", "MO"];
var listProvince2 = ["BO", "FE", "RA", "FC", "RN"];

//Aria (parte 1)
for(var i = 0; i < listProvince1.length; i++) {
    var stazioni = [];
    var response1 = syncRequest('GET','http://www.arpae.it/v2_rete_di_monitoraggio.asp?p='+listProvince1[i]+'&idlivello=1637');

    $ = cheerio.load(response1.getBody('utf-8'));
    for(var j = 0; j < $('table').find('select').children().length; j++) {
            stazioni.push($('table').find('select').find('option').eq(j).attr('value'));
    }

    for(var z = 0; z < stazioni.length; z++) {

        for(var x = 0; x < inquinanti.length; x++) {

            var response2 = syncRequest('GET','http://www.arpae.it/estraistaz.asp?q='+inquinanti[x]+'&i='+getDate()[0]+'&f='+getDate()[0]+'&s='+stazioni[z]+'&p='+listProvince1[i]);
            $ = cheerio.load(response2.getBody('utf-8'));

            if($('table').html() != null) {
                for(var y = 1; y < $('table').find('tr').length; y++) {
                    var stazione = $('table').find('tr').eq(y).find('td').eq(0).html();
                    var dataInizio = $('table').find('tr').eq(y).find('td').eq(1).html();
                    var dataFine = $('table').find('tr').eq(y).find('td').eq(2).html();
                    var valore = $('table').find('tr').eq(y).find('td').eq(4).html();

                    switch (inquinanti[x]) {
                        case 5:
                            var tipologia = "Pm10";
                            break;
                        case 7:
                            var tipologia = "Ozono";
                            break;
                        case 8:
                            var tipologia = "Biossido di azoto";
                            break;
                        case 10:
                            var tipologia = "Monossido di carbonio";
                            break;

                    }
                    var db = mysql.createConnection(db_config);

                    db.query('INSERT INTO Aria'+listProvince1[i]+'(stazione, dataInizio, dataFine, tipologia, valore) VALUES("'+stazione+'", "'+dataInizio+'", "'+dataFine+'", "'+tipologia+'", "'+valore+'")', function (err, rows, fields) {
                        if (!err) {
                            console.log(rows);
                        } else {
                            console.log(err);
                        }
                    });
                    db.end();
                }
            }

        }

    }
}

//Aria (parte 2)
for(var i = 0; i < listProvince2.length; i++) {
    var stazioni = [];
    var response1 = syncRequest('GET','http://www.arpae.it/v2_rete_di_monitoraggio.asp?p='+listProvince2[i]+'&idlivello=1637');

    $ = cheerio.load(response1.getBody('utf-8'));
    for(var j = 0; j < $('table').find('select').children().length; j++) {
            stazioni.push($('table').find('select').find('option').eq(j).attr('value'));
    }

    for(var z = 0; z < stazioni.length; z++) {

        for(var x = 0; x < inquinanti.length; x++) {

            var response2 = syncRequest('GET','http://www.arpae.it/estraistaz.asp?q='+inquinanti[x]+'&i='+getDate()[1]+'&f='+getDate()[1]+'&s='+stazioni[z]+'&p='+listProvince2[i]);
            $ = cheerio.load(response2.getBody('utf-8'));

            if($('table').html() != null) {
                for(var y = 1; y < $('table').find('tr').length; y++) {
                    var stazione = $('table').find('tr').eq(y).find('td').eq(0).html();
                    var dataInizio = $('table').find('tr').eq(y).find('td').eq(1).html();
                    var dataFine = $('table').find('tr').eq(y).find('td').eq(2).html();
                    var valore = $('table').find('tr').eq(y).find('td').eq(4).html();

                    switch (inquinanti[x]) {
                        case 5:
                            var tipologia = "Pm10";
                            break;
                        case 7:
                            var tipologia = "Ozono";
                            break;
                        case 8:
                            var tipologia = "Biossido di azoto";
                            break;
                        case 10:
                            var tipologia = "Monossido di carbonio";
                            break;

                    }
                    var db = mysql.createConnection(db_config);

                    db.query('INSERT INTO Aria'+listProvince2[i]+'(stazione, dataInizio, dataFine, tipologia, valore) VALUES("'+stazione+'", "'+dataInizio+'", "'+dataFine+'", "'+tipologia+'", "'+valore+'")', function (err, rows, fields) {
                        if (!err) {
                            console.log(rows);
                        } else {
                            console.log(err);
                        }
                    });
                    db.end();
                }
            }

        }

    }
}

//Campi elettromagnetici
for(var i = 0; i < listProvince.length; i++) {

        var response = syncRequest('GET', 'http://www.arpae.it/elettrosmog/elettrosmog.asp?prov='+listProvince[i]);
        $ = cheerio.load(response.getBody('utf-8'));

        for(var j = 0; j < $('.tabelladati').eq(0).find('tr').find('.etichettadato').length; j++) {

            if($('.tabelladati').find('tr').find('td').html() != "Comune")
                console.log("Non ci sono dati");

            else {
                var comune = $('.tabelladati').eq(0).find('tr').has('.etichettadato').eq(j).find('td').html();
                var indirizzo = $('.tabelladati').eq(0).find('tr').has('.etichettadato').eq(j).find('td').eq(4).html();
                var valore = $('.tabelladati').eq(0).find('tr').has('.etichettadato').eq(j).find('td').eq(8).html();
                var valPreciso = valore.split("< ")[0];

                if($('.tabelladati').eq(0).find('tr').has('.etichettadato').eq(j).find('td').eq(8).attr('style') == null)
                    var limite = "n.d.";

                else {

                    switch($('.tabelladati').eq(0).find('tr').has('.etichettadato').eq(j).find('td').eq(8).attr('style')) {
                        case "background: #99FF99;":
                            var limite = "ottimo";
                            break;
                        case "background: #FFFF99;":
                            var limite = "buono";
                            break;
                        case "background: #FF6666;":
                            var limite = "oltre il limite";
                            break;
                    }

                }
                var db = mysql.createConnection(db_config);

                db.query('INSERT INTO CampiElettro(provincia, comune, indirizzo, valoreMax, limite) VALUES("'+listProvince[i]+'","'+comune+'", "'+indirizzo+'", "'+valPreciso+'", "'+limite+'")', function (err, rows, fields) {
                    if (!err) {
                        console.log(rows);
                    } else {
                        console.log(err);
                    }
                });
                db.end();
            }

        }

}

//Indice pollini
var listLocation = ["Piacenza", "Parma", "Reggio Emilia", "Modena", "Bologna", "Faenza", "Forli", "Cesena", "Rimini", "Ravenna","S.Giovanni Persiceto", "S.Pietro Capofiume", "Ferrara"];
var listIndici = [4176, 4177, 4178, 4179, 4181, 4184, 4186, 4187, 4188, 4185, 4189, 4190, 4182];

for(var i = 0; i < listLocation.length; i++) {

    var indice = listIndici[i];
    var location = listLocation[i];

    var response = syncRequest('GET', 'http://www.arpae.it/pollini/?bollettini/boll_province&'+indice);
    $ = cheerio.load(response.getBody('utf-8'));
    var periodo = $('h4').html();
    var settimana = periodo.split('al ')[1]+"/ "+periodo.split('al ')[2];

    var mediaB = $('#famiglie').find('tr').eq(1).children().last().text();
    var mediaCo = $('#famiglie').find('tr').eq(3).children().last().text();
    var mediaG = $('#famiglie').find('tr').eq(5).children().last().text();
    var mediaCu = $('#famiglie').find('tr').eq(9).children().last().text();

    var livB = $('#famiglie').find('tr').eq(1).children().last().attr("class");
    var livCo = $('#famiglie').find('tr').eq(3).children().last().attr("class");
    var livG = $('#famiglie').find('tr').eq(5).children().last().attr("class");
    var livCu = $('#famiglie').find('tr').eq(9).children().last().attr("class");

    var db = mysql.createConnection(db_config);

    db.query('INSERT INTO Pollini(localita, periodo, mediaSettBetulacee, livelloB, mediaSettCorilacee, livelloCo, mediaSettGraminacee, livelloG, mediaSettCupressacee, livelloCu) VALUES("'+location+'","'+settimana+'", "'+mediaB+'", "'+livB+'", "'+mediaCo+'", "'+livCo+'", "'+mediaG+'", "'+livG+'", "'+mediaCu+'", "'+livCu+'")', function (err, rows, fields) {
        if (!err) {
            console.log(rows);
        } else {
            console.log(err);
        }
    });
    db.end();
}
