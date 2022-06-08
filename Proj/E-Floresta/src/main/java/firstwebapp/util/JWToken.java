package firstwebapp.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.appengine.repackaged.org.apache.commons.codec.binary.Base64;
import com.google.gson.Gson;
import javafx.util.Pair;

import java.util.Calendar;
import java.util.Date;

public class JWToken {

    private static final String SECRET = "secretdoprojeto";
    private static final Algorithm algorithm = Algorithm.HMAC256(SECRET);
    private static final JWTVerifier verifier = JWT.require(algorithm).withIssuer("E-Floresta").build();
    private static final Gson g = new Gson();
    private static final Base64 base64 = new Base64();

    public static String generateToken(String username, String role){
        return JWT.create()
                .withIssuer("E-Floresta")
                .withExpiresAt(getDateAfterTwoWeeks(new Date()))
                .withSubject(username)
                .withClaim("role", role)
                .sign(algorithm);
    }

    public static TokenInfo verifyToken(String token){
        try{
            DecodedJWT jwt = verifier.verify(token);

            String payload = new String(base64.decode(jwt.getPayload()));
            TokenInfo ti = g.fromJson(payload, TokenInfo.class);
            return ti;
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

    public class TokenInfo {
        public String sub;
        public String role;
        public String iss;
        public String exp;

        private TokenInfo(String sub, String role, String iss, String exp){
            this.sub = sub;
            this.role = role;
            this.iss = iss;
            this.exp = exp;
        }
    }
}
