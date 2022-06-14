package firstwebapp.util;

public class ParcelInfo {

    public String name;
    public Point[] coordinates;
    public String distrito;
    public String concelho;
    public String freguesia;
    public long area;
    public long perimeter;
    public byte[] photo;

    public ParcelInfo(){

    }

    public ParcelInfo(String name, Point[] coordinates, String distrito, String concelho, String freguesia, long area, long perimeter, byte[] photo) {
        this.name = name;
        this.coordinates = coordinates;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.area = area;
        this.perimeter = perimeter;
        this.photo = photo;
    }
}
