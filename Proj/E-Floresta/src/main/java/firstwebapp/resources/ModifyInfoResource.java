package firstwebapp.resources;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.*;
import firstwebapp.util.ModifyInfoData;
import org.apache.commons.codec.digest.DigestUtils;

import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/modify")
public class ModifyInfoResource {

    private static final Logger LOG = Logger.getLogger(ModifyInfoResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    @PUT
    @Path("{username}")
    public Response modifyInfo(@PathParam("username") String username, ModifyInfoData data){
        LOG.fine("Attempt to modify user: " + username);

        Key tokenKey = datastore.newKeyFactory().setKind("Token").newKey(data.tokenId);
        Entity token = datastore.get(tokenKey);

        if(token == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Not logged in.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(token.getString("token_username"));
        Entity user = datastore.get(userKey);


        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        if(!data.username.equals(token.getString("token_username"))){
            return Response.status(Response.Status.FORBIDDEN).entity("No permission.").build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            Entity newUser = Entity.newBuilder(userKey)
                                .set("user_name", data.name)
                                .set("user_pwd", user.getString("user_pwd"))
                                .set("user_email", data.email)
                                .set("user_phone", data.phone)
                                .set("user_nif", data.nif)
                                .set("user_creation_time", user.getTimestamp("user_creation_time"))
                                .set("user_role", user.getString("user_role"))
                                .set("user_state", user.getString("user_state"))
                                .set("user_type", user.getString("user_type"))
                                .build();
            txn.put(newUser);
            txn.commit();
            LOG.fine("Modiffied user: " + username);
            return Response.ok("User modified successfully.").build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }
}
