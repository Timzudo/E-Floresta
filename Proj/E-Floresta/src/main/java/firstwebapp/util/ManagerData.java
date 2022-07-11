package firstwebapp.util;

public class ManagerData {

    public String token;
    public String managerName;

    public ManagerData(){

    }

    public ManagerData(String token, String managerName) {
        this.token = token;
        this.managerName = managerName;
    }

    public boolean isValid(){
        return !managerName.equals("");
    }
}
