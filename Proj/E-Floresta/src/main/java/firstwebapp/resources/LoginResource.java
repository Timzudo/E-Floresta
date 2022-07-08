package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.LoginData;
import firstwebapp.util.RecoverPasswordData;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Logger;

@Path("/login")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class LoginResource {

    private static final Logger LOG = Logger.getLogger(LoginResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);

    Storage storage = StorageOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    @POST
    @Path("/{username}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(@PathParam("username") String username, LoginData data) {
        LOG.fine("Login attempt by user: " + username);

        //Cria a key e usa a key para ir buscar a entidade user certa
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);


        //Se o user existir
        if (user != null) {
            //Se a password tiver certa
            String storedPassword = user.getString("user_pwd");
            if (storedPassword.equals(DigestUtils.sha512Hex(data.password))) {

                //Gera um token
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

    @GET
    @Path("/forgotpassword")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response forgotPassword(@QueryParam("email") String email) throws UnsupportedEncodingException, MessagingException {

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("User")
                .setFilter(StructuredQuery.PropertyFilter.eq("user_email", email))
                .build();

        QueryResults<Entity> userListQuery = datastore.run(query);
        List<Entity> userList = new ArrayList<>();

        userListQuery.forEachRemaining(userList::add);

        if(userList.size()>1){
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
        else if(userList.size()==0){
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        String confirmationID = UUID.randomUUID().toString();
        Key forgotPasswordKey = datastore.newKeyFactory().setKind("ForgotPassword").newKey(confirmationID);

        String username = userList.get(0).getKey().getName();

        Transaction txn = datastore.newTransaction();

        try{
            Entity forgotPassword = Entity.newBuilder(forgotPasswordKey)
                    .set("forgotPassword_username", username)
                    .build();


            txn.add(forgotPassword);
            txn.commit();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        }


        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress("eflorestaapdc@gmail.com", "Equipa E-Floresta"));
        msg.addRecipient(Message.RecipientType.TO,
                new InternetAddress(email, "Caro utilizador"));
        msg.setSubject("Recuperar password E-Floresta");
        msg.setText("Olá " + username + ". \nClique neste link para recuperar a sua palavra-passe: " + "http://localhost:3000/recover?id=" + confirmationID);
        Transport.send(msg);

        return Response.ok().build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/recoverpassword/{id}")
    public Response recoverPassword(@PathParam("id") String id, RecoverPasswordData data){
        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        Key forgotPasswordKey = datastore.newKeyFactory().setKind("ForgotPassword").newKey(id);
        Entity forgotPassword = datastore.get(forgotPasswordKey);
        if(forgotPassword == null){
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(forgotPassword.getString("forgotPassword_username"));
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist").build();
        }

        Transaction txn = datastore.newTransaction();
        try{
            user = Entity.newBuilder(user)
                    .set("user_pwd", DigestUtils.sha512Hex(data.newPassword))
                    .build();

            txn.update(user);
            txn.delete(forgotPasswordKey);
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
}
