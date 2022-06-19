package firstwebapp.resources;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.RegistrationData;
import org.apache.commons.codec.digest.DigestUtils;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/register")
public class RegisterResource {
    private static final Logger LOG = Logger.getLogger(RegisterResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();


    @POST
    @Path("/personal/{username}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerPersonal(@PathParam("username") String username, RegistrationData data){
        return register(username, data, "D");
    }

    @POST
    @Path("/entity/{username}")
    public Response registerEntity(@PathParam("username") String username, RegistrationData data){
        return register(username, data, "C");
    }


    public Response register(String username, RegistrationData data, String role){
        LOG.fine("Attempt to register user: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
            Entity user = datastore.get(userKey);

            if(user != null){
                txn.rollback();
                return Response.status(Response.Status.CONFLICT).entity("User already exists.").build();
            }
            else{
                user = Entity.newBuilder(userKey)
                        .set("user_name", data.name)
                        .set("user_pwd", DigestUtils.sha512Hex(data.password))
                        .set("user_email", data.email)
                        .set("user_phone", data.phone)
                        .set("user_nif", data.nif)
                        .set("user_creation_time", Timestamp.now())
                        .set("user_role", role)
                        .set("user_state", "INACTIVE")
                        .set("user_trust", 3)
                        .build();
            }

            txn.add(user);
            LOG.info("User registered " + username);
            txn.commit();

            String token = JWToken.generateToken(username, role);

            return Response.ok(token).build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
            }
        }
    }
}
