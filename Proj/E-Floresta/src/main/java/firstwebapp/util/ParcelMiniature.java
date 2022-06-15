package firstwebapp.util;

import java.net.URL;

public class ParcelMiniature {

    public String name;
    public String distrito;
    public String concelho;
    public String freguesia;
    public long area;
    public long perimeter;
    public URL photoURL;

    public ParcelMiniature(){

    }

    public ParcelMiniature(String name, String distrito, String concelho, String freguesia, long area, long perimeter, URL photoURL) {
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.area = area;
        this.perimeter = perimeter;
        this.photoURL = photoURL;
    }
}
