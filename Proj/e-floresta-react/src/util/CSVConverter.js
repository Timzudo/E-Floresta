import React, {Component, useEffect} from 'react';
//import csv from "./teste.csv";


const CSVConverter = () => {

    function checkCSV() {

        let xmlhttp = new XMLHttpRequest();

        if(localStorage.getItem("csv") === null){
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        let csv = xmlhttp.responseText;
                        let json = csvJSON(csv);
                        localStorage.setItem('csv', json);
                    }
                }
            }

            var myObj = { token: localStorage.getItem('token') };
            var myJson = JSON.stringify(myObj);

            xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/getCSV", false);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.send(myJson);
        }
    }

    function csvJSON(csv){

        let lines=csv.split("\n");
        let obj = {};


        for(let i=1;i<lines.length-1;i++){
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

    useEffect(() =>
    {
        checkCSV();
    }, [])

    return(
        <></>
    )
}


export default CSVConverter