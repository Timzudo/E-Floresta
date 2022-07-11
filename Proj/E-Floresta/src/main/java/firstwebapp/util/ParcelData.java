package firstwebapp.util;

public class ParcelData {
    public String cover;
    public String usage;
    public String oldUsage;
    public String description;
    public String token;

    public ParcelData(){

    }

    public ParcelData(String cover, String usage, String oldUsage, String description, String token) {
        this.cover = cover;
        this.usage = usage;
        this.oldUsage = oldUsage;
        this.description = description;
        this.token = token;
    }

    public boolean isValid(){
        return !cover.equals("") && !usage.equals("") && !oldUsage.equals("");

    }
}
