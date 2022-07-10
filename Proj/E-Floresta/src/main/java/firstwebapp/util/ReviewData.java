package firstwebapp.util;

public class ReviewData {

    public String token;
    public String opinion;

    public ReviewData(){

    }

    public ReviewData(String token, String opinion) {
        this.token = token;
        this.opinion = opinion;
    }

    public boolean isValid(){
        return (opinion.equals("POSITIVE") || opinion.equals("NEGATIVE") || opinion.equals("NEUTRAL"));
    }
}
