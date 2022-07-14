package firstwebapp.util;

import java.net.URL;

public class ParcelMiniature {

    public String name;
    public String distrito;
    public String concelho;
    public String freguesia;
    public String owner;
    public String manager;
    public String isApproved;
    public URL photoURL;
    public String coordinates;
    public long area;
    public String usage;

    public ParcelMiniature(){

    }

    public ParcelMiniature(String name, String distrito, String concelho,  String freguesia, String owner, String manager, String isApproved, URL photoURL, String coordinates, long area, String usage) {
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.owner = owner;
        this.manager = manager;
        this.isApproved = isApproved;
        this.photoURL = photoURL;
        this.coordinates = coordinates;
        this.area = area;
        this.usage = usage;
    }
}
