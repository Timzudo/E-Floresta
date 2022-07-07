package firstwebapp.util;

public class ReportData {

    public String token;
    public String topic;
    public String text;

    public ReportData(){

    }

    public ReportData(String token, String topic, String text) {
        this.token = token;
        this.topic = topic;
        this.text = text;
    }
}
