package firstwebapp.resources;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.TokenData;
import firstwebapp.util.UserProfileInfo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/info")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class GetInfoResource {

    private static final Logger LOG = Logger.getLogger(GetInfoResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    @POST
    @Path("/profileinfo")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserInfo(TokenData token){
        LOG.info("Attempt to get info of user with token: " + token.token);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(token.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        String s = user.getString("user_role");

        switch (s){
            case "A1":
                s = "System admin";
                break;
            case "A2":
                s = "Moderador";
                break;
            case "B1":
                s = "Técnico camarário";
                break;
            case "B2":
                s = "Técnico da junta";
                break;
            case "C":
                s = "Entidade";
                break;
            case "D":
                s = "Utilizador";
                break;
        }

        UserProfileInfo data = new UserProfileInfo(userKey.getName(),
                                    user.getString("user_email"),
                                    user.getString("user_name"),
                                    user.getString("user_phone"),
                                    user.getString("user_nif"),
                                    s,
                                    user.getString("user_state"),
                                    (int) (user.getLong("user_trust")/20));

        return Response.ok(g.toJson(data)).build();

    }
}
