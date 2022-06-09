import  './LoggedHomepage.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Carousel} from "react-bootstrap";

const LoggedHomepage = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="lgh_Carousel">
                <Carousel>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src='./foto1-slider.jpg'
                            alt="Primeira foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src='./foto2-slider.jpg'
                            alt="Segunda foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src='./foto3-slider.jpg'
                            alt="Terceira foto"
                        />
                    </Carousel.Item>
                </Carousel>
            </div>

        </>
    )
}
export default LoggedHomepage
