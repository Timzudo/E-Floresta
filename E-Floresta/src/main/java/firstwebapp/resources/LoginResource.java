package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.AuthToken;
import firstwebapp.util.LoginData;
import org.apache.commons.codec.digest.DigestUtils;

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

    @POST
    @Path("/{username}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(@PathParam("username") String username, LoginData data) {
        LOG.fine("Login attempt by user: " + username);

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        AuthToken authToken = new AuthToken(username, user.getString("user_role"));

        Key tokenId = datastore.newKeyFactory().setKind("Token").newKey(authToken.tokenID);

        Entity token = Entity.newBuilder(tokenId)
                .set("token_username", username)
                .set("token_role", authToken.role)
                .set("token_creation", authToken.creationDate)
                .set("token_expiration", authToken.expirationDate).build();

        Transaction txn = datastore.newTransaction();

        try {
            if (user != null) {
                String storedPassword = user.getString("user_pwd");
                if (storedPassword.equals(DigestUtils.sha512Hex(data.password))) {
                    txn.add(token);
                    txn.commit();
                    LOG.info("User " + username + " logged in sucessfully.");
                    return Response.ok(g.toJson(authToken.tokenID)).build();

                } else {
                    txn.rollback();
                    LOG.warning("Wrong password for username: " + username);
                    return Response.status(Response.Status.FORBIDDEN).build();
                }
            } else {
                txn.rollback();
                LOG.warning("Failed login attempt for username: " + username);
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } finally {
            if (txn.isActive()) {
                txn.rollback();
            }
        }
    }
}
