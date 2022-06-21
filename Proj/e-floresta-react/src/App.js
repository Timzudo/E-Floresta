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
import Front_img from "./front_img.png";
import React, { Component }  from 'react';

import {Button} from "react-bootstrap";

import {
  BrowserRouter as Router,
  Routes, Route, Link
} from "react-router-dom"
import MyParcels from "./MyParcels/MyParcels";



const App = () => {

  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  let languageCookie = "EN";

  ca.forEach((cookie) => {
    if (cookie.includes("language")) {
      languageCookie = cookie.substring(cookie.indexOf("=") + 1, cookie.length);
    }
  });

  const [language, setLanguage] = useState(languageCookie);

  function languageChange(newLanguage) {
    if (newLanguage == "EN") {
      document.cookie = "language=EN; path=/";
    } else {
      document.cookie = "language=PT; path=/";
    }

    setLanguage(newLanguage);
  }

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home callback={languageChange} language={language}/>} />
          <Route path="/create-and-login" element={<CreateAndLogin language={language}/>} />
          <Route path="/map" element={<RegisterParcel language={language}/>} />
          <Route path="/profile" element={<Profile language={language}/>} />
          <Route path="/homepage" element={<LoggedHomepage language={language}/>} />
          <Route path="/change-profile" element={<ChangeProfile language={language}/>} />
          <Route path="/change-password" element={<ChangePassword language={language}/>} />
          <Route path="/about-us" element={<AboutUs language={language}/>} />
          <Route path="/my-parcels" element={<MyParcels language={language}/>} />
        </Routes>
      </Router>
  )
}

const Home = () => {

  handleChange = (props) => (event) => {
    if (!event.target.checked) {
      // this.setState({ language: "PT" });
      props.callback("PT");
    } else {
      // this.setState({ language: "EN" });
      props.callback("EN");
    }
  };

  const { language } = this.props;
  // console.log(language);
  // this.setState({languageState: language});

  // const { languageState } = this.state;

  let disabled;

  if (language == "EN") {
    disabled = true;
  } else {
    disabled = false
  }

  return (
      <>
        <CheckIfLoggedIn />

        <div className="home_top">

          <div>
            <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
          </div>

          <div className="home_button">
            <Link to="/create-and-login">
              <Button id="topButton_Home" type="button">{language == "EN" ? "Login | Create Account" : "Login | Criar Conta"}</Button>
            </Link>
          </div>

          <div>
            <span
              className="language"
              id="PT"
              style={{ color: language == "EN" ? "" : "#01767c" }}
            >
              PT
            </span>
            <PurpleSwitch checked={disabled} onChange={this.handleChange(this.props)} />
            <span
              className="language"
              id="EN"
              style={{ color: language == "PT" ? "" : "#01767c" }}
            >
              EN
            </span>
          </div>

        </div>

        <div className="home_body">

            <div className="hero-image_Home">
                <div className="hero-text_Home">
                    <h1><b>E-Floresta</b></h1>
                    <p>{language == "EN" ? "Register your plots quickly and easily" : "Registe as suas parcelas de forma rápida e fácil"}</p>
                    <Link to="/create-and-login">
                        <Button id="button-hero_Home" variant="dark">{language == "EN" ? "Start now" : "Comece já"}</Button>
                    </Link>
                </div>
            </div>

            <div className="text_Home">
                <div>
                    <h1>
                    {language == "EN" ? "What is the E-Floresta project all about?" : "O que é o projeto E-Floresta?"}
                    </h1>
                    {language == "EN" ? "The interior of Portugal is currently going through a populational desertification, which "
                    + "is being cause by the younger generation moving more and more towards the coast, and the population getting "
                    + "older and older. This has serious consequences, not only on an economic level but also socially and for the " 
                    + "environment. One case in particular is the management of the forest regions, which has become almost non-existent. " 
                    + "This causes economic loss and serious damage to the ecosystems due to the forest fires which come about because of "
                    + "the lack of care. Therefore, with this project, the autarchy of Mação intends to reorganize their territory, taking "
                    + "the initiative and promoting the management of the plots of land in the forest regions to fight these issues." 
                    : "O interior de Portugal está a viver um processo de desertificação populacional provocado pelo movimento"
                    +" dos mais jovens para o litoral e pelo envelhecimento da população com graves consequências económicas, "
                    +"sociais e ambientais. Em particular, a gestão da floresta torna-se incomportável, dando origem a perdas "
                    + "económicas e ambientais resultantes dos incêndios florestais. Assim, a autarquia de Mação pretende "
                    + "reordenar o seu território liderando uma iniciativa que promove a gestão integrada dos terrenos florestais "
                    + "para ganhar escala e reduzir custos. "}
                    <p> {language == "EN" ? "This web platform allows property owners to register and take part in this community initiative, "
                    +"and follow the progress of the project in terms of costs and results" : "Esta plataforma web permite registar a adesão voluntária "
                    + "dos proprietáriosa esta iniciativa comunitária e, posteriormente, seguir a sua gestão em termos de custos e proveitos."} 
                    </p>
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


