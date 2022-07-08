package firstwebapp.util;

public class ReportMiniature {

    public String reportID;
    public String parcelName;
    public String sender;
    public String distrito;
    public String concelho;
    public String freguesia;
    public String topic;
    public String message;
    public long priority;

    public ReportMiniature() {
    }

    public ReportMiniature(String reportID, String parcelName, String sender, String distrito, String concelho, String freguesia, String topic, String message, long priority) {
        this.reportID = reportID;
        this.parcelName = parcelName;
        this.sender = sender;
        this.distrito = distrito;
        this.concelho = concelho;
        this.freguesia = freguesia;
        this.topic = topic;
        this.message = message;
        this.priority = priority;
    }
}
