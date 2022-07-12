package firstwebapp.util;

import javax.ws.rs.core.Response;

public class ModifyParcelCoordinatesData {

    public String token;
    public String coordinates;

    public ModifyParcelCoordinatesData() {
    }

    public ModifyParcelCoordinatesData(String token, String coordinates) {
        this.token = token;
        this.coordinates = coordinates;
    }

    public boolean isValid(){
        return !coordinates.equals("");
    }
}
