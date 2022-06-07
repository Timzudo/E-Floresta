package firstwebapp.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.gson.Gson;
import javafx.util.Pair;

import java.util.Calendar;
import java.util.Date;

public class JWToken {

    private static final String SECRET = "secretdoprojeto";
    private static final Algorithm algorithm = Algorithm.HMAC256(SECRET);
    private static final JWTVerifier verifier = JWT.require(algorithm).withIssuer("E-Floresta").build();
    private static final Gson g = new Gson();

    public static String generateToken(String username, String role){
        return JWT.create()
                .withIssuer("E-Floresta")
                .withExpiresAt(getDateAfterTwoWeeks(new Date()))
                .withSubject(username)
                .withClaim("role", role)
                .sign(algorithm);
    }

    public static Pair<String, String> verifyToken(String token){
        try{
            DecodedJWT jwt = verifier.verify(token);

            TokenInfo ti = g.fromJson(jwt.getPayload(), TokenInfo.class);
            return new Pair<>(ti.sub, ti.role);
        }
        catch (JWTVerificationException exception){
            return null;
        }
    }


    private static Date getDateAfterTwoWeeks(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.DATE, +14); //2 weeks
        return calendar.getTime();
    }

    private class TokenInfo {
        public String sub;
        public String role;
        private String exp;
        private TokenInfo(String sub, String role, String exp){
            this.sub = sub;
            this.role = role;
            this.exp = exp;
        }
    }
}
