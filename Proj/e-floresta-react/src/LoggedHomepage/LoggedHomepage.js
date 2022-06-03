import  './LoggedHomepage.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";

const LoggedHomepage = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <div className="lhp-i-text">
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
export default LoggedHomepage
