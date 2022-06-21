import  './AboutUs.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, { Component }  from 'react';

const AboutUs = () => {
    const { language } = this.props;
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar language={language} />
            <div className="about-us">
                <h1>
                    {language == "EN"
                    ? "E-floresta Team!"
                    : "Equipa E-floresta!"}
                </h1>
            </div>

            <div className="initial-text">
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
        </>
    )
}
export default AboutUs