package pt.unl.fct.di.example.apdc2021.rest;

import pt.unl.fct.di.example.apdc2021.util.LoginData;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface RestAPI {

    @POST("login/{username}")
    Call<String> login(@Path ("username") String username, @Body LoginData data);
}
