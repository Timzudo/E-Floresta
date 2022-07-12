import React, {Component, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
//import csv from "./teste.csv";

const expirationTime = 1000*60*60*24*7;

const CSVConverter = () => {

    const navigate = useNavigate();

    function checkCSV() {

        let xmlhttp = new XMLHttpRequest();
        console.log(Date.now());
        console.log(parseInt(localStorage.getItem('csvTime')));

        if(localStorage.getItem("csv") === null || localStorage.getItem("csvTime") === null || (Date.now() > parseInt(localStorage.getItem('csvTime')))){
            xmlhttp.onreadystatechange = async function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        let csv = xmlhttp.responseText;
                        let json = await csvJSON(csv);
                        localStorage.setItem('csv', json);
                        localStorage.setItem('csvTime', (Date.now() + expirationTime).toString());
                    } else if (xmlhttp.status === 403) {
                        localStorage.removeItem('token');
                        navigate('/');
                    } else {
                        alert("Erro do sistema. Tente novamente mais tarde.");
                    }
                }
            }

            var myObj = { token: localStorage.getItem('token') };
            var myJson = JSON.stringify(myObj);

            xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/getCSV", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.send(myJson);
        }
    }

    async function  csvJSON(csv){

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