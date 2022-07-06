package firstwebapp.resources;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.EntityRegistrationData;
import firstwebapp.util.JWToken;
import firstwebapp.util.RegistrationData;
import org.apache.commons.codec.digest.DigestUtils;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Logger;

@Path("/register")
public class RegisterResource {
    private static final Logger LOG = Logger.getLogger(RegisterResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);


    @POST
    @Path("/personal/{username}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerPersonal(@PathParam("username") String username, RegistrationData data) throws UnsupportedEncodingException, MessagingException {
        LOG.fine("Attempt to register personal account: " + username);

        if(!data.validRegistration()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user != null){
            return Response.status(Response.Status.CONFLICT).entity("User already exists.").build();
        }
        String confirmationID = UUID.randomUUID().toString();
        Key confirmationKey = datastore.newKeyFactory().setKind("Confirmation").newKey(confirmationID);

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
                    .set("user_concelho", "")
                    .set("user_freguesia", "")
                    .build();

            Entity confirmation = Entity.newBuilder(confirmationKey)
                            .set("confirmation_username", username)
                                    .build();


            txn.add(user, confirmation);
            LOG.info("Personal user registered " + username);
            txn.commit();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        }

        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress("eflorestaapdc@gmail.com", "Example.com Admin"));
        msg.addRecipient(Message.RecipientType.TO,
                new InternetAddress(data.email, "Mr. User"));
        msg.setSubject("Confirme o seu e-mail.");
        msg.setText("Olá " + data.name + " criou recentemente uma conta no serviço E-Floresta. \nClique neste link para confirmar o seu e-mail: " + "http://localhost:3000/confirmation?id=" + confirmationID);
        Transport.send(msg);

        String token = JWToken.generateToken(username, "D");
        return Response.ok(token).build();
    }

    @GET
    @Path("/confirm/{id}")
    public Response confirmEmail(@PathParam("id") String id){

        Key confirmationKey = datastore.newKeyFactory().setKind("Confirmation").newKey(id);
        Entity confirmation = datastore.get(confirmationKey);
        if(confirmation == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(confirmation.getString("confirmation_username"));
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist").build();
        }

        Transaction txn = datastore.newTransaction();
        try{
            user = Entity.newBuilder(user)
                    .set("user_state", "CONFIRMED")
                    .build();

            txn.update(user);
            txn.delete(confirmationKey);
            txn.commit();
            return Response.ok().build();
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
                    .set("user_concelho", "")
                    .set("user_freguesia", "")
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
