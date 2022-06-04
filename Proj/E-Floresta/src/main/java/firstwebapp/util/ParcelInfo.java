package firstwebapp.util;

public class ParcelInfo {

    public String name;
    public float[][] coordinates;

    public ParcelInfo(){

    }

    public ParcelInfo(String name, float[][] coordinates){
        this.name = name;
        this.coordinates = coordinates;
    }
}
