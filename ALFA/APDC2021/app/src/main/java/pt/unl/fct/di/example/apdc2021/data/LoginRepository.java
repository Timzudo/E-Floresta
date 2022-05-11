package pt.unl.fct.di.example.apdc2021.data;

import java.util.concurrent.Executor;

import pt.unl.fct.di.example.apdc2021.data.model.LoggedInUser;
import pt.unl.fct.di.example.apdc2021.ui.login.RepositoryCallback;

/**
 * Class that requests authentication and user information from the remote data source and
 * maintains an in-memory cache of login status and user credentials information.
 */
public class LoginRepository {

    private static volatile LoginRepository instance;

    private LoginDataSource dataSource;

    private final Executor executor;

    // If user credentials will be cached in local storage, it is recommended it be encrypted
    // @see https://developer.android.com/training/articles/keystore
    private LoggedInUser user = null;

    // private constructor : singleton access
    private LoginRepository(LoginDataSource dataSource, Executor executor) {
        this.dataSource = dataSource;
        this.executor = executor;
    }

    public static LoginRepository getInstance(LoginDataSource dataSource, Executor executor) {
        if (instance == null) {
            instance = new LoginRepository(dataSource, executor);
        }
        return instance;
    }

    public boolean isLoggedIn() {
        return user != null;
    }

    public void logout() {
        user = null;
        dataSource.logout();
    }

    private void setLoggedInUser(LoggedInUser user) {
        this.user = user;
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }

    public void loginThread(String username, String password, final RepositoryCallback<LoggedInUser> callback){
        executor.execute(new Runnable() {
            @Override
            public void run() {
                try{
                    Result<LoggedInUser> result = login(username, password);
                    callback.onComplete(result);
                }
                catch (Exception e){
                    Result<LoggedInUser> errorResult = new Result.Error(e);
                    callback.onComplete(errorResult);
                }
            }
        });
    }

    public Result<LoggedInUser> login(String username, String password) {
        // handle login
        Result<LoggedInUser> result = dataSource.login(username, password);
        if (result instanceof Result.Success) {
            setLoggedInUser(((Result.Success<LoggedInUser>) result).getData());
        }
        return result;
    }
}