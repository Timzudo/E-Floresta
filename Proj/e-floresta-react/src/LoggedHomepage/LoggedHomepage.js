import  './LoggedHomepage.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Carousel} from "react-bootstrap";
import Image1 from './foto1-slider.jpg'
import Image2 from './foto2-slider.jpg'
import Image3 from './foto3-slider.jpg'

const LoggedHomepage = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="lgh_Carousel">
                <Carousel>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 h-80"
                            src={Image1}
                            alt="Primeira foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={Image2}
                            alt="Segunda foto"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={Image3}
                            alt="Terceira foto"
                        />
                    </Carousel.Item>
                </Carousel>
            </div>

        </>
    )
}
export default LoggedHomepage
