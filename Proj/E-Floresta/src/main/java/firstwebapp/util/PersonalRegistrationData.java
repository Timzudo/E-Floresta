package firstwebapp.util;

public class PersonalRegistrationData {

    public String password;
    public String confirmation;
    public String email;
    public String name;
    public String phone;
    public String nif;


    public PersonalRegistrationData() {

    }

    public PersonalRegistrationData(String password, String confirmation, String email, String name, String phone, String nif) {
        this.password = password;
        this.confirmation = confirmation;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.nif = nif;
    }

    public boolean validRegistration() {
        boolean checkNull = !(password.equals("") || confirmation.equals("") || email.equals("") || name.equals(""));
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
