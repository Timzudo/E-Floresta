import './WaitForVerif.css'
import React from 'react'
import {Link} from "react-router-dom";
import Image from "../logo.png";


const WaitForVerif = () => {
    return(
        <>
            <div className="home_top">
                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>

            <div className="bg-img_WFV">
                <div className="body_WFV">
                    <br/>
                    <h2 className="title_WFV"><b>Um e-mail de confirmação foi enviado!</b></h2>
                    <br/>
                    <p className="description_WFV">
                        Para garantir o bom funcionamento do site, enviámos-lhe um e-mail para o mail fornecido no formulário.
                        Por favor, verifique o seu e-mail, clique no link que lhe enviámos e inicie sessão. Assim que o fizer, poderá começar
                        a explorar e utilizar o site.
                    </p>
                    <p className="description_WFV">
                       Nota: se não encontrar o e-mail enviado, por favor, verifique o seu Spam.
                    </p>

                </div>
            </div>
        </>
    )
}

export default WaitForVerif