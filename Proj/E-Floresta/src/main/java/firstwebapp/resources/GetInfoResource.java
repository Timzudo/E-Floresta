package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.TokenData;
import firstwebapp.util.UserProfileInfo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/info")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class GetInfoResource {

    private static final Logger LOG = Logger.getLogger(GetInfoResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    @POST
    @Path("/profileinfo")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserInfo(TokenData token){
        LOG.info("Attempt to get info of user with token: " + token.token);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(token.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        String s = tokenInfo.role;

        switch (s){
            case "A1":
                s = "System admin";
                break;
            case "A2":
                s = "Moderador";
                break;
            case "B1":
                s = "Técnico camarário";
                break;
            case "B2":
                s = "Técnico da junta";
                break;
            case "C":
                s = "Entidade";
                break;
            case "D":
                s = "Utilizador";
                break;
        }

        UserProfileInfo data = new UserProfileInfo(userKey.getName(),
                                    user.getString("user_email"),
                                    user.getString("user_name"),
                                    user.getString("user_phone"),
                                    user.getString("user_nif"),
                                    s,
                                    user.getString("user_state"),
                                    (int) ((user.getLong("user_trust")-1)/40)+1,
                                    user.getString("user_role"));

        return Response.ok(g.toJson(data)).build();

    }

    @POST
    @Path("/profileinfo/{checkUsername}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkUserInfo(@PathParam("checkUsername") String checkUsername, TokenData token){
        LOG.info("Attempt to get info of user with token: " + token.token);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(token.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("No such user.").build();
        }


        Key checkUserKey = datastore.newKeyFactory().setKind("User").newKey(checkUsername);
        Entity checkUser = datastore.get(checkUserKey);
        if(checkUser == null){
            return Response.status(Response.Status.NOT_FOUND).entity("No such user.").build();
        }

        String role = tokenInfo.role;

        if(role.equals("B1")){
            Query<Entity> query = Query.newEntityQueryBuilder()
                    .setKind("Parcel")
                    .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_owner", checkUsername),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                    .build();

            QueryResults<Entity> parcelListQuery = datastore.run(query);
            if(!parcelListQuery.hasNext()){
                return Response.status(Response.Status.FORBIDDEN).build();
            }
        }
        else if(role.equals("B2")){
            Query<Entity> query = Query.newEntityQueryBuilder()
                    .setKind("Parcel")
                    .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_owner", checkUsername),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"))))
                    .build();

            QueryResults<Entity> parcelListQuery = datastore.run(query);
            if(!parcelListQuery.hasNext()){
                return Response.status(Response.Status.FORBIDDEN).build();
            }
        }
        else if(role.equals("C")){
            Query<Entity> query = Query.newEntityQueryBuilder()
                    .setKind("Parcel")
                    .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_owner", checkUsername),
                                StructuredQuery.PropertyFilter.eq("parcel_manager", username)))
                    .build();

            Query<Entity> query2 = Query.newEntityQueryBuilder()
                    .setKind("Parcel")
                    .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_owner", checkUsername),
                            StructuredQuery.PropertyFilter.eq("parcel_requested_manager", username)))
                    .build();


            QueryResults<Entity> parcelListQuery = datastore.run(query);
            QueryResults<Entity> parcelListQuery2 = datastore.run(query2);
            if(!parcelListQuery.hasNext() && !parcelListQuery2.hasNext()){
                return Response.status(Response.Status.FORBIDDEN).build();
            }
        } else if (role.equals("D") && !checkUsername.equals(username)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        String s = checkUser.getString("user_role");

        switch (s){
            case "A1":
                s = "System admin";
                break;
            case "A2":
                s = "Moderador";
                break;
            case "B1":
                s = "Técnico camarário";
                break;
            case "B2":
                s = "Técnico da junta";
                break;
            case "C":
                s = "Entidade";
                break;
            case "D":
                s = "Utilizador";
                break;
        }

        UserProfileInfo data = new UserProfileInfo(checkUserKey.getName(),
                checkUser.getString("user_email"),
                checkUser.getString("user_name"),
                checkUser.getString("user_phone"),
                checkUser.getString("user_nif"),
                s,
                checkUser.getString("user_state"),
                (int) ((checkUser.getLong("user_trust")-1)/40)+1,
                checkUser.getString("user_role"));

        return Response.ok(g.toJson(data)).build();

    }

}
