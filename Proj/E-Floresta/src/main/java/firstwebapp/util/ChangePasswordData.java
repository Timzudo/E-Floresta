package firstwebapp.util;

public class ChangePasswordData {

    public String oldPassword;
    public String newPassword;
    public String confirmation;
    public String token;

    public ChangePasswordData(){

    }

    public ChangePasswordData(String oldPassword, String newPassword, String confirmation, String token){
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confirmation = confirmation;
        this.token = token;
    }

    public boolean validPassword(){
        return newPassword.equals(confirmation) && newPassword.length()>=6;
    }
}
