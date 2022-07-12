package firstwebapp.util;

public class RegistrationData {

    public String password;
    public String confirmation;
    public String email;
    public String name;
    public String phone;
    public String nif;
    public String distrito;
    public String concelho;

    public RegistrationData() {

    }

    public RegistrationData(String password, String confirmation, String email, String name, String phone, String nif, String distrito, String concelho) {
        this.password = password;
        this.confirmation = confirmation;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.nif = nif;
        this.distrito = distrito;
        this.concelho = concelho;
    }

    public boolean validRegistration() {
        boolean checkNull = !(password.equals("") || confirmation.equals("") || email.equals("") || name.equals("") || distrito.equals("") || concelho.equals(""));
        boolean checkPassword = password.equals(confirmation) && password.length()>=6;
        boolean checkEmail = true;

        String[] emailC = email.split("@");
        if(emailC.length<2){
            checkEmail = false;
        }

        String[] dns = emailC[1].split("\\.");
        if(dns.length<2){
            checkEmail = false;
        }

        return checkNull && checkPassword && checkEmail;
    }
}
