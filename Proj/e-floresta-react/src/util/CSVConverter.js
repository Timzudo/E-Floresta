import React, { Component }  from 'react';
//import csv from "./teste.csv";


const CSVConverter = () => {

    const csv = `3;Aveiro;Águeda;Aguada de Cima;010103;https://dados.gov.pt/s/brasoes/010103.png;
3;Aveiro;Águeda;Fermentelos;010109;https://dados.gov.pt/s/brasoes/010109.png;
3;Aveiro;Águeda;Macinhata do Vouga;010112;https://dados.gov.pt/s/brasoes/010112.png;
3;Lisboa;Cadaval;União das freguesias de Lamas e Cercal;110412;`

    let xmlhttp = new XMLHttpRequest();

    (function get() {

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    let csv = xmlhttp.responseText;
                    console.log(csv)
                    let json = csvJSON(csv);
                    localStorage.setItem('csv', json);
                }
            }
        }

        var myObj = { token: localStorage.getItem('token') };
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/getCSV", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    })();



    function csvJSON(csv){

        let lines=csv.split("\n");

        let obj = {};


        for(var i=1;i<lines.length;i++){
            let currentline=lines[i].split(";");

            let distrito = currentline[1];
            if(!obj.hasOwnProperty(distrito)){
                obj[distrito] = {};
            }

            let concelho = currentline[2];
            if(!obj[distrito].hasOwnProperty(concelho)){
                obj[distrito][concelho] = {};
            }

            let freguesia = currentline[3];
            obj[distrito][concelho][freguesia] ={
                dicofre:freguesia = currentline[4]
            }
        }

        return JSON.stringify(obj);
    }

    return(
        <></>
    )
}

export default CSVConverter