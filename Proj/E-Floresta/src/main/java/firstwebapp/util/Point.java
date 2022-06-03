package firstwebapp.util;

public class Point {

    public double lat;
    public double lng;

    public Point(){

    }

    public Point(double[] list){
        this.lat = list[0];
        this.lng = list[1];
    }
}
