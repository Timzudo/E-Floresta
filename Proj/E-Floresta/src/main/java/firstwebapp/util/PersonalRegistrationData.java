package firstwebapp.util;

public class PersonalRegistrationData extends RegistrationData{

    public PersonalRegistrationData(){
        super();
    }

    public PersonalRegistrationData(String password, String confirmation, String email, String name, String phone, String nif){
        super(password, confirmation, email, name, phone, nif);
    }

}
