package firstwebapp.util;

public class RoleData {

    public String token;
    public String newRole;
    public String distrito;
    public String concelho;
    public String freguesia;

    public RoleData() {
    }

    public RoleData(String token, String newRole, String distrito, String concelho, String freguesia) {
        this.token = token;
        this.newRole = newRole;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
    }

    public boolean isValid(){
        boolean csv = ((newRole.equals("B1") || newRole.equals("C") && !distrito.equals("") && !concelho.equals("")) && freguesia.equals("") ||
                ((newRole.contains("A") || newRole.equals("D")) && distrito.equals("") && concelho.equals("") &&  freguesia.equals("")) ||
                (newRole.equals("B2") && !distrito.equals("") && !concelho.equals("") && !freguesia.equals("")));
        return (newRole.equals("A1") || newRole.equals("A2") || newRole.equals("B1") || newRole.equals("B2") || newRole.equals("C") || newRole.equals("D")) && csv;
    }
}
