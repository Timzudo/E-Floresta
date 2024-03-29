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
import ApproveParcelsAdmin from "./ApproveParcelsAdmin/ApproveParcelsAdmin";
import AllParcels from "./AllParcels/AllParcels";
import AllParcelsAdmin from "./AllParcelsAdmin/AllParcelsAdmin";
import Statistics from "./Statistics/Statistics";
import StatisticsEntity from "./StatisticsEntity/StatisticsEntity";
import StatisticsTechnician from "./StatisticsTechnician/StatisticsTechnician";
import StatisticsAdmin from "./StatisticsAdmin/StatisticsAdmin";
import ConfirmationPage from "./ConfirmationPage/ConfirmationPage";
import Rankings from "./Rankings/Rankings";
import RecoverPassword from "./RecoverPassword/RecoverPassword";
import RecoverRequest from "./RecoverPassword/RecoverRequest";
import FindUser from "./FindUser/FindUser";
import ReportsTechnician from "./ReportsTechnician/ReportsTechnician";
import MakeReport from "./MakeReport/MakeReport";
import FAQ from "./FAQ/FAQ";
import FAQUnlogged from "./FAQUnlogged/FAQUnlogged";
import WaitForVerif from "./WaitForVerif/WaitForVerif";
import Error404 from "./ErrorsPages/Error404";
import CSVConverter from "./util/CSVConverter";



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
          <Route path="/approve-parcels-admin" element={<ApproveParcelsAdmin />} />
          <Route path="/all-parcels" element={<AllParcels />} />
          <Route path="/all-parcels-admin" element={<AllParcelsAdmin />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/statistics-entity" element={<StatisticsEntity />} />
          <Route path="/statistics-technician" element={<StatisticsTechnician />} />
          <Route path="/statistics-admin" element={<StatisticsAdmin />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/recover" element={<RecoverPassword />} />
          <Route path="/recover-request" element={<RecoverRequest />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/find-user" element={<FindUser />} />
          <Route path="/reports-technician" element={<ReportsTechnician />} />
          <Route path="/make-report" element={<MakeReport />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq-unlogged" element={<FAQUnlogged />} />
          <Route path="/wait-for-verif" element={<WaitForVerif />} />
          <Route path="*" exact={false} element={<Error404 />} />
        </Routes>
      </Router>
  )
}

const Home = () => {
  return (
      <>
        <CSVConverter/>
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
                    <p>Registe e gerencie as suas parcelas de forma rápida e fácil!</p>
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
                    <br/>
                    O interior de Portugal está a viver um processo de desertificação populacional provocado pelo movimento
                    dos mais jovens para o litoral e pelo envelhecimento da população com graves consequências económicas,
                    sociais e ambientais. Em particular, a gestão da floresta torna-se incomportável, dando origem a perdas
                    económicas e ambientais resultantes dos incêndios florestais. Assim, a autarquia de Mação pretende
                    reordenar o seu território liderando uma iniciativa que promove a gestão integrada dos terrenos florestais
                    para ganhar escala e reduzir custos. <p> <br/> Esta plataforma web permite registar a adesão voluntária dos proprietários
                    a esta iniciativa comunitária e, posteriormente, seguir a sua gestão em termos de custos e proveitos. </p>
                </div>
                <div>
                    <img src={Front_img}/>
                </div>
            </div>

            <div className="hero-image-faq_Home">
                <div className="hero-text-faq_Home">
                    <h1><b>Perguntas frequentes</b></h1>
                    <p>Tem alguma questão sobre a utilização do nosso site? </p>
                    <p>Verifique a página de perguntas frequentes! </p>
                    <Link to="/faq-unlogged">
                        <Button id="button-hero_Home" variant="dark">FAQ</Button>
                    </Link>
                </div>
            </div>

        </div>

      </>
  )
}

export default App


