package pt.unl.fct.di.example.apdc2021.ui.login;

import pt.unl.fct.di.example.apdc2021.data.Result;

public interface RepositoryCallback<T> {
    void onComplete(Result<T> result);
}
