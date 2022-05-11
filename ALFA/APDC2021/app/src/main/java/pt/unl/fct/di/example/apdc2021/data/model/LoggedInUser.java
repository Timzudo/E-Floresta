package pt.unl.fct.di.example.apdc2021.data.model;

/**
 * Data class that captures user information for logged in users retrieved from LoginRepository
 */
public class LoggedInUser {

    private String userId;
    private String tokenId;

    public LoggedInUser(String userId, String tokenId) {
        this.userId = userId;
        this.tokenId = tokenId;
    }

    public String getUserId() {
        return userId;
    }

    public String getToken() {
        return tokenId;
    }
}