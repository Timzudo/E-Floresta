package firstwebapp.util;

public class ModifyInfoData {


    public String name;
    public String phone;
    public String nif;
    public String token;

    public ModifyInfoData(){

    }

    public ModifyInfoData(  String name, String email, String phone, String nif, String token){
        this.token = token;
        this.name = name;
        this.phone = phone;
        this.nif = nif;
    }
}
