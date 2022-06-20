package firstwebapp.util;

import java.net.URL;

public class ParcelMiniature {

    public String name;
    public String distrito;
    public String concelho;
    public String freguesia;
    public boolean isApproved;
    public long area;
    public long perimeter;
    public URL photoURL;
    public String coordinates;

    public ParcelMiniature(){

    }

    public ParcelMiniature(String name, String distrito, String concelho, String freguesia, boolean isApproved, long area, long perimeter, URL photoURL, String coordinates) {
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.isApproved = isApproved;
        this.area = area;
        this.perimeter = perimeter;
        this.photoURL = photoURL;
        this.coordinates = coordinates;
    }
}
