package firstwebapp.util;

import java.net.URL;
import java.util.List;

public class ParcelInfo {

    public String name;
    public String distrito;
    public String concelho;
    public String freguesia;
    public long area;
    public long perimeter;
    public String coordinates;
    public String photoURL;
    public String documentURL;
    public String owner;
    String manager;

    public ParcelInfo(){

    }

    public ParcelInfo(String name, String distrito, String concelho, String freguesia, long area, long perimeter, String coordinates, String owner, String manager) {
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.area = area;
        this.perimeter = perimeter;
        this.coordinates = coordinates;
        this.owner = owner;
        this.manager = manager;
    }
}
