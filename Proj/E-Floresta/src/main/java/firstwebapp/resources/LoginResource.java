package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
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


        if (user != null) {
            String storedPassword = user.getString("user_pwd");
            if (storedPassword.equals(DigestUtils.sha512Hex(data.password))) {

                String token = JWToken.generateToken(username, user.getString("user_role"));

                return Response.ok(token).build();
            } else {
                LOG.warning("Wrong password for username: " + username);
                return Response.status(Response.Status.FORBIDDEN).build();
            }
        } else {
            LOG.warning("Failed login attempt for username: " + username);
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
