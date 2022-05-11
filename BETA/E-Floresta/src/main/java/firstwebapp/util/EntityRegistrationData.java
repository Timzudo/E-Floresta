package firstwebapp.util;

public class EntityRegistrationData extends RegistrationData {

    public EntityRegistrationData(){
        super();
    }

    public EntityRegistrationData(String username, String password, String confirmation, String email, String name, String phone, String nif){
        super(username, password, confirmation, email, name, phone, nif);
    }
}
