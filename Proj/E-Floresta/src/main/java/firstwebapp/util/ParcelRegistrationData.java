package firstwebapp.util;

public class ParcelRegistrationData {


    public String name;
    public Point[] coordinates;
    public String distrito;
    public String concelho;
    public String freguesia;
    public long area;
    public long perimeter;
    public String photo;
    //public byte[] document;


    public ParcelRegistrationData(){

    }

    public ParcelRegistrationData(String name, String distrito, String concelho, String freguesia, String photo,/* byte[] document,*/ Point[] coordinates, long area, long perimeter){
        this.name = name;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.photo = photo;
        //this.document = document;
        this.coordinates = coordinates;
        this.area = area;
        this.perimeter = perimeter;
    }

    public boolean validRegistration(){
        return (!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  &&/* document != null &&*/ !coordinates.equals("")  && coordinates.length >= 3);
    }
}
