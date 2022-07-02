package firstwebapp.util;

import java.net.URL;
import java.util.List;

public class ParcelInfo {


    public String documentURL;
    public String usage;
    public String oldUsage;
    public String cover;
    public String description;

    public ParcelInfo(){

    }

    public ParcelInfo(String documentURL, String usage, String oldUsage, String cover, String description) {
        this.documentURL = documentURL;
        this.usage = usage;
        this.oldUsage = oldUsage;
        this.cover = cover;
        this.description = description;
    }
}
