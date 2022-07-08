package firstwebapp.util;

public class RecoverPasswordData {

    public String newPassword;
    public String confirmation;

    public RecoverPasswordData() {
    }

    public RecoverPasswordData(String newPassword, String confirmation) {
        this.newPassword = newPassword;
        this.confirmation = confirmation;
    }

    public boolean isValid(){
        return newPassword.equals(confirmation);
    }
}
