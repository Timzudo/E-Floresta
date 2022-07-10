package firstwebapp.resources;

import com.google.cloud.datastore.*;
import firstwebapp.util.*;
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

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key userModifyKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity userModify = datastore.get(userModifyKey);
        if(userModify == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        if(!tokenInfo.role.contains("A") && !tokenInfo.sub.equals(username)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        //Cria transacao
        Transaction txn = datastore.newTransaction();

        try{
            //Atualiza a entidade
            userModify = Entity.newBuilder(userModify)
                                .set("user_name", data.name)
                                .set("user_phone", data.phone)
                                .set("user_nif", data.nif)
                                .build();
            //Da update na transacao e commit
            txn.update(userModify);
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
    @Path("/state/{username}")
    public Response modifyState(@PathParam("username") String username, StateData data){
        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        //Verifica o token
        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key userModifyKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity userModify = datastore.get(userModifyKey);
        if(userModify == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        if(!tokenInfo.role.contains("A")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        //Cria transacao
        Transaction txn = datastore.newTransaction();

        try{
            //Atualiza a entidade
            userModify = Entity.newBuilder(userModify)
                    .set("user_state", data.newState)
                    .build();
            //Da update na transacao e commit
            txn.update(userModify);
            txn.commit();
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
    @Path("/role/{username}")
    public Response modifyRole(@PathParam("username") String username, RoleData data){
        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        //Verifica o token
        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key userModifyKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity userModify = datastore.get(userModifyKey);
        if(userModify == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        if(!tokenInfo.role.contains("A")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        if(tokenInfo.role.equals("A2") && data.newRole.equals("A1")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        //TODO ALTERAR CONCELHO DISTRITO
        Transaction txn = datastore.newTransaction();

        try{
            //Atualiza a entidade
            userModify = Entity.newBuilder(userModify)
                    .set("user_role", data.newRole)
                    .set("user_distrito", data.distrito)
                    .set("user_concelho", data.concelho)
                    .set("user_freguesia", data.freguesia)
                    .build();
            //Da update na transacao e commit
            txn.update(userModify);
            txn.commit();
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
