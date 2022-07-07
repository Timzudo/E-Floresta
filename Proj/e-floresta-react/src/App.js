import Image from './logo.png'

import './App.css'
import CreateAndLogin from './CreateAndLogin/CreateAndLogin'
import Profile from './Profile/Profile'
import LoggedHomepage from "./LoggedHomepage/LoggedHomepage"
import ChangeProfile from "./ChangeProfile/ChangeProfile"
import AboutUs from "./AboutUs/AboutUs"
import RegisterParcel from './RegisterParcel/RegisterParcel'
import CheckIfLoggedIn from './util/CheckIfLoggedIn'
import ChangePassword from "./ChangePassword/ChangePassword";
import MyParcels from "./MyParcels/MyParcels";
import ProposedParcelsEntity from "./ProposedParcelsEntity/ProposedParcelsEntity";
import ParcelsEntity from "./ParcelsEntity/ParcelsEntity";
import ApproveParcels from "./ApproveParcels/ApproveParcels";
import AllParcels from "./AllParcels/AllParcels";
import StatisticsEntity from "./StatisticsEntity/StatisticsEntity";
import ConfirmationPage from "./ConfirmationPage/ConfirmationPage";
import Rankings from "./Rankings/Rankings";

import Front_img from "./front_img.jpg";
import React, { Component }  from 'react';
import {Button} from "react-bootstrap";

import {
  BrowserRouter as Router,
  Routes, Route, Link
} from "react-router-dom"





const App = () => {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-and-login" element={<CreateAndLogin />} />
          <Route path="/map" element={<RegisterParcel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/homepage" element={<LoggedHomepage />} />
          <Route path="/change-profile" element={<ChangeProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/my-parcels" element={<MyParcels />} />
          <Route path="/proposed-parcels-entity" element={<ProposedParcelsEntity />} />
          <Route path="/parcels-entity" element={<ParcelsEntity />} />
          <Route path="/approve-parcels" element={<ApproveParcels />} />
          <Route path="/all-parcels" element={<AllParcels />} />
          <Route path="/statistics-entity" element={<StatisticsEntity />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/rankings" element={<Rankings />} />
        </Routes>
      </Router>
  )
}

const Home = () => {
  return (
      <>
        <CheckIfLoggedIn />

        <div className="home_top">

          <div>
            <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
          </div>

          <div className="home_button">
            <Link to="/create-and-login">
              <Button id="topButton_Home" type="button">Login | Criar Conta</Button>
            </Link>
          </div>

        </div>

        <div className="home_body">

            <div className="hero-image_Home">
                <div className="hero-text_Home">
                    <h1><b>E-Floresta</b></h1>
                    <p>Registe as suas parcelas de forma rápida e fácil</p>
                    <Link to="/create-and-login">
                        <Button id="button-hero_Home" variant="dark">Comece já</Button>
                    </Link>
                </div>
            </div>

            <div className="text_Home">
                <div>
                    <h1>
                        O que é o projeto E-Floresta?
                    </h1>

                    O interior de Portugal está a viver um processo de desertificação populacional provocado pelo movimento
                    dos mais jovens para o litoral e pelo envelhecimento da população com graves consequências económicas,
                    sociais e ambientais. Em particular, a gestão da floresta torna-se incomportável, dando origem a perdas
                    económicas e ambientais resultantes dos incêndios florestais. Assim, a autarquia de Mação pretende
                    reordenar o seu território liderando uma iniciativa que promove a gestão integrada dos terrenos florestais
                    para ganhar escala e reduzir custos. <p> Esta plataforma web permite registar a adesão voluntária dos proprietários
                    a esta iniciativa comunitária e, posteriormente, seguir a sua gestão em termos de custos e proveitos. </p>
                </div>
                <div>
                    <img src={Front_img}/>
                </div>

            </div>
        </div>

      </>
  )
}

export default App


