package firstwebapp.util;

public class EntityRegistrationData extends RegistrationData {

    public EntityRegistrationData(){
        super();
    }

    public EntityRegistrationData( String password, String confirmation, String email, String name, String phone, String nif){
        super(password, confirmation, email, name, phone, nif);
    }
}
