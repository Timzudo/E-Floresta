import  './LoggedHomepage.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Button, Carousel, Modal} from "react-bootstrap";
import Image1 from './foto1-slider.jpg'
import Image2 from './foto2-slider.jpg'
import Image3 from './foto3-slider.jpg'
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import React, { Component }  from 'react';
import CSVConverter from "../util/CSVConverter";

const LoggedHomepage = () => {

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <CSVConverter/>

            <div className="lgh_Carousel">
                <Carousel>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 h-80"
                            src={Image1}
                            alt="Primeira foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={Image2}
                            alt="Segunda foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={Image3}
                            alt="Terceira foto"
                        />
                    </Carousel.Item>
                </Carousel>
            </div>

        </>
    )
}
export default LoggedHomepage
