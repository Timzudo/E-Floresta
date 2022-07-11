package firstwebapp.util;

public class ParcelInfo {


    public String documentURL;
    public String photoURL;
    public String usage;
    public String oldUsage;
    public String cover;
    public String description;
    public String managerRequest;

    public ParcelInfo(){

    }

    public ParcelInfo(String documentURL, String photoURL, String usage, String oldUsage, String cover, String description, String managerRequest) {
        this.documentURL = documentURL;
        this.photoURL = photoURL;
        this.usage = usage;
        this.oldUsage = oldUsage;
        this.cover = cover;
        this.description = description;
        this.managerRequest = managerRequest;
    }
}
