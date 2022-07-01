package firstwebapp.resources;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.EntityRegistrationData;
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


    @POST
    @Path("/personal/{username}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerPersonal(@PathParam("username") String username, RegistrationData data){
        LOG.fine("Attempt to register personal account: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user != null){
            return Response.status(Response.Status.CONFLICT).entity("User already exists.").build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            user = Entity.newBuilder(userKey)
                    .set("user_name", data.name)
                    .set("user_pwd", DigestUtils.sha512Hex(data.password))
                    .set("user_email", data.email)
                    .set("user_phone", data.phone)
                    .set("user_nif", data.nif)
                    .set("user_creation_time", Timestamp.now())
                    .set("user_role", "D")
                    .set("user_state", "INACTIVE")
                    .set("user_trust", 40)
                    .build();


            txn.add(user);
            LOG.info("Personal user registered " + username);
            txn.commit();

            String token = JWToken.generateToken(username, "D");

            return Response.ok(token).build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        }
    }

    @POST
    @Path("/entity/{username}")
    public Response registerEntity(@PathParam("username") String username, EntityRegistrationData data){
        LOG.fine("Attempt to register Entity account: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user != null){
            return Response.status(Response.Status.CONFLICT).entity("User already exists.").build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            user = Entity.newBuilder(userKey)
                    .set("user_name", data.name)
                    .set("user_pwd", DigestUtils.sha512Hex(data.password))
                    .set("user_email", data.email)
                    .set("user_phone", data.phone)
                    .set("user_nif", data.nif)
                    .set("user_creation_time", Timestamp.now())
                    .set("user_role", "C")
                    .set("user_state", "INACTIVE")
                    .set("user_trust", 40)
                    .set("user_distrito", data.distrito)
                    .set("user_concelho", data.concelho)
                    .build();


            txn.add(user);
            LOG.info("Entity user registered " + username);
            txn.commit();

            String token = JWToken.generateToken(username, "C");

            return Response.ok(token).build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        }
    }
}
