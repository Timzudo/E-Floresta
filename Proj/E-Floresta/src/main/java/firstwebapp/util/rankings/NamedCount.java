package firstwebapp.util.rankings;

import java.io.Serializable;

public class NamedCount implements Serializable {

    private String name;
    private Long count;

    public NamedCount(String name, Long count) {
        this.name = name;
        this.count = count;
    }

    public String getName() {
        return name;
    }

    public Long getCount() {
        return count;
    }
}