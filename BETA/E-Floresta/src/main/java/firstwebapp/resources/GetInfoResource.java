package firstwebapp.resources;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.gson.Gson;
import firstwebapp.util.UserProfileInfo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/info")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class GetInfoResource {

    private static final Logger LOG = Logger.getLogger(LoginResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    @POST
    @Path("/profileinfo")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserInfo(String tokenId){
        LOG.info("Attempt to get info of user with token: " + tokenId);

        Key tokenKey = datastore.newKeyFactory().setKind("Token").newKey(tokenId);
        Entity token = datastore.get(tokenKey);

        if(token == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Not logged in.").build();
        }


        Key userKey = datastore.newKeyFactory().setKind("User").newKey(token.getString("token_username"));
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        UserProfileInfo data = new UserProfileInfo(userKey.getName(), user.getString("user_email"),
                                    user.getString("user_name"), user.getString("user_phone"),
                                    user.getString("user_nif"), user.getString("user_type"));

        return Response.ok(g.toJson(data)).build();

    }


}
