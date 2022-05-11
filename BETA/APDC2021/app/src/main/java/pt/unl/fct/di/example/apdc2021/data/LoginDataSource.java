package pt.unl.fct.di.example.apdc2021.data;

import pt.unl.fct.di.example.apdc2021.data.model.LoggedInUser;
import pt.unl.fct.di.example.apdc2021.rest.RestAPI;
import pt.unl.fct.di.example.apdc2021.util.LoginData;
import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;

/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
public class LoginDataSource {

    private final RestAPI service;

    public LoginDataSource(){
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("https://modified-talon-344017.oa.r.appspot.com/rest/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        this.service = retrofit.create(RestAPI.class);
    }

    public Result<LoggedInUser> login(String username, String password) {

        try {
            Call<String> token = service.login(username, new LoginData(password));
            Response<String> r = token.execute();
            if(r.isSuccessful()){
                LoggedInUser newUser = new LoggedInUser(username, r.body());
                return new Result.Success<>(newUser);
            }
            else{
                return new Result.Error(new Exception("Forbidden"));
            }

        } catch (Exception e) {
            return new Result.Error(new IOException("Error logging in", e));
        }
    }

    public void logout() {
        // TODO: revoke authentication
    }
}