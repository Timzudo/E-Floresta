package firstwebapp.util;

public class ParcelInfo {

    public String name;
    public float[][] coordinates;
    public String distrito;
    public String concelho;
    public String freguesia;
    public byte[] photo;
    public byte[] document;


    public ParcelInfo(){

    }

    public ParcelInfo(String name, String distrito, String concelho, String freguesia, byte[] photo, byte[] document, float[][] coordinates){
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.photo = photo;
        this.document = document;
        this.coordinates = coordinates;
    }

    public boolean validRegistration(){
        return (name != null && distrito != null && concelho != null && freguesia != null && photo != null && document != null && coordinates != null && coordinates.length >= 3);
    }
}
