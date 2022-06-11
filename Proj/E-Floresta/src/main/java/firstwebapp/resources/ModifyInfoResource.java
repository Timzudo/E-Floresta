package firstwebapp.resources;

import com.google.cloud.datastore.*;
import firstwebapp.util.ChangePasswordData;
import firstwebapp.util.JWToken;
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
    @Path("/info/{username}")
    public Response modifyInfo(@PathParam("username") String username, ModifyInfoData data){
        LOG.fine("Attempt to modify user: " + username);

        //Verifica o token
        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        //Cria a key e usa a key para ir buscar a entidade user certa
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Se o user n existir
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        //Cria transacao
        Transaction txn = datastore.newTransaction();

        try{
            //Atualiza a entidade
            Entity newUser = Entity.newBuilder(user)
                                .set("user_name", data.name)
                                .set("user_phone", data.phone)
                                .set("user_nif", data.nif)
                                .build();
            //Da update na transacao e commit
            txn.update(newUser);
            txn.commit();
            LOG.fine("Modified user: " + username);
            return Response.ok("User modified successfully.").build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }


    @PUT
    @Path("/password/{username}")
    public Response changePassword(@PathParam("username") String username, ChangePasswordData data){
        LOG.fine("Attempt to change password of user: " + username);

        if(!data.validPassword()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        String storedPassword = user.getString("user_pwd");
        if (!storedPassword.equals(DigestUtils.sha512Hex(data.oldPassword))) {
            return Response.status(Response.Status.FORBIDDEN).entity("Incorrect password.").build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            Entity newUser = Entity.newBuilder(user)
                    .set("user_pwd", DigestUtils.sha512Hex(data.newPassword))
                    .build();
            txn.update(newUser);
            txn.commit();
            LOG.fine("Modified user: " + username);
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
