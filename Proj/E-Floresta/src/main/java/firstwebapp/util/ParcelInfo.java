package firstwebapp.util;

import com.google.gson.Gson;

import java.util.List;

public class ParcelInfo {


    public String name;
    public Point[] coordinates;
    public String distrito;
    public String concelho;
    public String freguesia;
    /*public byte[] photo;
    public byte[] document;*/


    public ParcelInfo(){

    }

    public ParcelInfo(String name, String distrito, String concelho, String freguesia, /*byte[] photo, byte[] document,*/ Point[] coordinates){
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        /*this.photo = photo;
        this.document = document;*/
        this.coordinates = coordinates;
    }

    public boolean validRegistration(){
        return (!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  && /*photo != null && document != null &&*/ !coordinates.equals("")  && coordinates.length >= 3);
    }
}
