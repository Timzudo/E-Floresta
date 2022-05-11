package firstwebapp.util;

public class ModifyInfoData {

    public String username;
    public String tokenId;
    public String name;
    public String email;
    public String phone;
    public String nif;

    public ModifyInfoData(){

    }

    public ModifyInfoData(String username, String tokenId, String name, String email, String phone, String nif){
        this.username = username;
        this.tokenId = tokenId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.nif = nif;
    }
}
