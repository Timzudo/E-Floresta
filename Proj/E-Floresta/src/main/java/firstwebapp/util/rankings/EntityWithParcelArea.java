package firstwebapp.util.rankings;

import java.io.Serializable;

public class EntityWithParcelArea implements Serializable {
    public String name;
    public Long parcelArea;

    public EntityWithParcelArea() {

    }

    public EntityWithParcelArea(String name, Long parcelArea) {
        this.name = name;
        this.parcelArea = parcelArea;
    }
}