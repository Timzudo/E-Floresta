package firstwebapp.util;

public class RoleData {

    public String token;
    public String newRole;

    public RoleData() {
    }

    public RoleData(String token, String newRole) {
        this.token = token;
        this.newRole = newRole;
    }

    public boolean isValid(){
        return newRole.equals("A1") || newRole.equals("A2") || newRole.equals("B1") || newRole.equals("B2") || newRole.equals("C") || newRole.equals("D");
    }
}
