import './Error404.css'
import React from 'react';
import {Link} from "react-router-dom";
import Image from "../logo.png";
import Image1 from "./icon.png";
import {Button} from "react-bootstrap";
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";

const Error404 = () => {

    return(
        <>
          {localStorage.getItem('token') === null?
          <div className="home_top">
            <div>
                <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
            </div>
          </div>
          :
          <>
              <CheckIfLoggedOut />
              <TopBar />
          </>
          }

          <div className="bg-img_Error404">
            <div className="body_Error404">
                <br/>
                <img src={Image1} alt="E-Floresta Ícone" className="icon_Error404" />
                <br/>
                <h1 className="title_Error404"><b>Esta página não foi encontrada</b></h1>
                <h3 className="description_Error404">Ups! Algo deu errado... A página que procura não existe.</h3>
                <br/>

                {localStorage.getItem('token') === null ?
                    <Link to="/">
                        <Button type="button" id="button_Error404" className="btn btn-success"> Voltar à página inicial </Button>
                    </Link>
                    :
                    <Link to="/homepage">
                        <Button type="button" id="button_Error404" className="btn btn-success"> Voltar à página inicial </Button>
                    </Link>
                }
            </div>
          </div>
        </>
    )

}

export default Error404