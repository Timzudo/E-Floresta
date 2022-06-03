import  './AboutUs.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedIn from "../util/CheckIfLoggedIn";

const AboutUs = () => {
    return(
        <>
            <CheckIfLoggedIn />
            <TopBar />
            <div className="about-us">
                <h1>Equipa E-Floresta!</h1>
            </div>
        </>
    )
}
export default AboutUs