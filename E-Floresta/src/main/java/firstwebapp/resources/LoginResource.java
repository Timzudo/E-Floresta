package firstwebapp.resources;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.gson.Gson;
import firstwebapp.util.AuthToken;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/login")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class LoginResource {

    private static final Logger LOG = Logger.getLogger(LoginResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    /*@POST
    @Path("{username}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(@PathParam("username") String username, String password){
        LOG.fine("Login attempt by user: " + username);

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        AuthToken authToken = new AuthToken();

        Key tokenId = datastore.newKeyFactory().setKind("Token").newKey(authToken.tokenID);

        Entity token = Entity.newBuilder(tokenId)
                .set("token_username", username)
                .set("token_role", authToken.role)
                .set("token_creation", authToken.creationDate)
                .set("token_expiration", authToken.expirationDate).build();
    }*/

}
