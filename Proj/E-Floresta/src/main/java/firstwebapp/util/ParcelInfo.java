package firstwebapp.util;

import java.net.URL;
import java.util.List;

public class ParcelInfo {


    public String documentURL;
    public String usage;
    public String oldUsage;

    public ParcelInfo(){

    }

    public ParcelInfo(String documentURL, String usage, String oldUsage) {
        this.documentURL = documentURL;
        this.usage = usage;
        this.oldUsage = oldUsage;
    }
}
