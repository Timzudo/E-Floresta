import TopBar from "../TopBar/TopBar.js"
import Map from "../Map/Map.js"
import CheckIfLoggedIn from "../util/CheckIfLoggedIn";


const RegisterPortion = () => {
    return(
        <>

        <CheckIfLoggedIn />
        <TopBar/>
            <div className="map_RegisterPortion">
                <Map/>
            </div>
        </>
    )
}

export default RegisterPortion