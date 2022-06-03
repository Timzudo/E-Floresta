import  './AboutUs.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";

const AboutUs = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <div className="about-us">
                <h1>Equipa E-Floresta!</h1>
            </div>
        </>
    )
}
export default AboutUs