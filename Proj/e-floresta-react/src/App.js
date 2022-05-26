import { useState } from 'react'
import Image from './logo.png'
import './App.css'
import CreateAndLogin from './create-and-login/CreateAndLogin'
import NewMap from './Map/Map'

import {
  BrowserRouter as Router,
  Routes, Route, Link
} from "react-router-dom"
import { Button } from 'react-bootstrap'


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-and-login" element={<CreateAndLogin />} />
        <Route path="/map" element={<NewMap />} />
      </Routes>
    </Router>
  )
}

const Home = () => {
  return (
    <>
      <div className="top">
        <div className="logoDiv">
        <Link to="/"><img src={Image} alt="E-Floresta Logo" className="logo_app" /></Link>
        </div>
        
        <div className="button">
          <Link to="/create-and-login">
          <button type="button" className="btn btn-light">Login | Create Account</button>
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