package firstwebapp.util;

public class ParcelData {
    public String distrito;
    public String concelho;
    public String freguesia;
    public String token;

    public ParcelData(){

    }

    public ParcelData(String distrito, String concelho, String freguesia, String token) {
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.token = token;
    }
}
