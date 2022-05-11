package firstwebapp.util;

public class PersonalRegistrationData extends RegistrationData{

    public PersonalRegistrationData(){
        super();
    }

    public PersonalRegistrationData(String username, String password, String confirmation, String email, String name, String phone, String nif){
        super(username, password, confirmation, email, name, phone, nif);
    }

}
