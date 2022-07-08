package firstwebapp.util;

public class StateData {

    public String token;
    public String newState;

    public StateData() {
    }

    public StateData(String token, String newState) {
        this.token = token;
        this.newState = newState;
    }

    public boolean isValid(){
        return newState.equals("ACTIVE") || newState.equals("INACTIVE");
    }
}
