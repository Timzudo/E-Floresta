package firstwebapp.util;

import java.net.URL;

public class ParcelMiniature {

    public String name;
    public String freguesia;
    public String owner;
    public String manager;
    public boolean isApproved;
    public URL photoURL;
    public String coordinates;
    public long area;

    public ParcelMiniature(){

    }

    public ParcelMiniature(String name, String freguesia, String owner, String manager, boolean isApproved, URL photoURL, String coordinates, long area) {
        this.name = name;
        this.freguesia = freguesia;
        this.owner = owner;
        this.manager = manager;
        this.isApproved = isApproved;
        this.photoURL = photoURL;
        this.coordinates = coordinates;
        this.area = area;
    }
}
