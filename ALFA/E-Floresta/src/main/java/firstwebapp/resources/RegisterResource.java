package firstwebapp.resources;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.AuthToken;
import firstwebapp.util.EntityRegistrationData;
import firstwebapp.util.PersonalRegistrationData;
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
    public Response registerPersonal(@PathParam("username") String username, PersonalRegistrationData data){
        LOG.fine("Attempt to register user: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(data.username);
        Entity user = datastore.get(userKey);

        AuthToken authToken = new AuthToken(username, "USER");

        Key tokenId = datastore.newKeyFactory().setKind("Token").newKey(authToken.tokenID);

        Entity token = Entity.newBuilder(tokenId)
                .set("token_username", username)
                .set("token_role", authToken.role)
                .set("token_creation", authToken.creationDate)
                .set("token_expiration", authToken.expirationDate).build();

        Transaction txn = datastore.newTransaction();

        try{
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
                        .set("user_role", "USER")
                        .set("user_state", "ACTIVE")
                        .set("user_type", "personal")
                        .build();
            }

            txn.add(user);
            txn.add(token);
            LOG.info("User registered " + data.username);
            txn.commit();

            return Response.ok(g.toJson(authToken.tokenID)).build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
            }
        }
    }

    @POST
    @Path("/entity/{username}")
    public Response registerEntity(@PathParam("username") String username, EntityRegistrationData data){
        LOG.fine("Attempt to register user: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        AuthToken authToken = new AuthToken(username, "USER");

        Key tokenId = datastore.newKeyFactory().setKind("Token").newKey(authToken.tokenID);

        Entity token = Entity.newBuilder(tokenId)
                .set("token_username", username)
                .set("token_role", authToken.role)
                .set("token_creation", authToken.creationDate)
                .set("token_expiration", authToken.expirationDate).build();

        Transaction txn = datastore.newTransaction();

        try{
            Key userKey = datastore.newKeyFactory().setKind("User").newKey(data.username);
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
                        .set("user_role", "USER")
                        .set("user_state", "INACTIVE")
                        .set("user_type", "entity")
                        .build();
            }

            txn.add(user);
            txn.add(token);
            LOG.info("User registered " + data.username);
            txn.commit();

            return Response.ok(g.toJson(authToken.tokenID)).build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
            }
        }
    }
}