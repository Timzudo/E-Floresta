package firstwebapp.util.rankings;

import java.io.Serializable;

public class EntityWithUserTrust implements Serializable {

    public String name;
    public Long userTrust;

    public EntityWithUserTrust() {

    }

    public EntityWithUserTrust(String name, Long userTrust) {
        this.name = name;
        this.userTrust = userTrust;
    }
}