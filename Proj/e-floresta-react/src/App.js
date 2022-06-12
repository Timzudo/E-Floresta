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
              <button type="button" className="btn btn-light">Login | Criar Conta</button>
            </Link>
          </div>

        </div>

        <div className="initial-text">
          O interior de Portugal está a viver um processo de desertificação populacional provocado pelo movimento
          dos mais jovens para o litoral e pelo envelhecimento da população com graves consequências económicas,
          sociais e ambientais. Em particular, a gestão da floresta torna-se incomportável, dando origem a perdas
          económicas e ambientais resultantes dos incêndios florestais. Assim, a autarquia de Mação pretende
          reordenar o seu território liderando uma iniciativa que promove a gestão integrada dos terrenos florestais
          para ganhar escala e reduzir custos. <p> Esta plataforma web permite registar a adesão voluntária dos proprietários
          a esta iniciativa comunitária e, posteriormente, seguir a sua gestão em termos de custos e proveitos. </p>
        </div>
      </>
  )
}

export default App


