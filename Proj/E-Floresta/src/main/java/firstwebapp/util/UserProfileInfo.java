package firstwebapp.util;

public class UserProfileInfo {

    public String username;
    public String email;
    public String name;
    public String phone;
    public String nif;
    public String type;
    public String state;
    public int grade;
    public String role;

    public UserProfileInfo(){

    }

    public UserProfileInfo(String username, String email, String name, String phone, String nif, String type, String state, int grade, String role) {
        this.username = username;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.nif = nif;
        this.type = type;
        this.state = state;
        this.grade = grade;
        this.role = role;
    }
}
