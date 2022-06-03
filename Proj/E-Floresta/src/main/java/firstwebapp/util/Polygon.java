package firstwebapp.util;

public class Polygon {

    public String type;
    public Point[][] list;

    public Polygon(){

    }

    public Polygon(String type, Point[][] list){
        this.type = type;
        this.list = list;
    }
}
