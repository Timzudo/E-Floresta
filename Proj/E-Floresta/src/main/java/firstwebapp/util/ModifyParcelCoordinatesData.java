package firstwebapp.util;

import javax.ws.rs.core.Response;

public class ModifyParcelCoordinatesData {

    public String token;
    public String coordinates;
    public String area;
    public String perimeter;

    public ModifyParcelCoordinatesData() {
    }

    public ModifyParcelCoordinatesData(String token, String coordinates, String area, String perimeter) {
        this.token = token;
        this.coordinates = coordinates;
        this.area = area;
        this.perimeter = perimeter;
    }

    public boolean isValid(){
        return !coordinates.equals("") && !area.equals("") && !perimeter.equals("");
    }
}
