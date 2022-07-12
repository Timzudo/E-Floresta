package firstwebapp.util.rankings;

import java.io.Serializable;

public class EntityWithParcelCount implements Serializable {
    public String name;
    public Long parcelCount;

    public EntityWithParcelCount() {

    }

    public EntityWithParcelCount(String name, Long parcelCount) {
        this.name = name;
        this.parcelCount = parcelCount;
    }
}