package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.ParcelInfo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/parcel")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class ParcelResource {

    private static final Logger LOG = Logger.getLogger(LoginResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private final Gson g = new Gson();

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerParcel(@QueryParam("Token") String token, ParcelInfo parcelInfo){
        LOG.fine("Attempt to register parcel.");

        if(!parcelInfo.validRegistration()){
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing or wrong parameter.").build();
        }

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        String parcelId = username + "." + parcelInfo.name;

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelId);
        Entity parcel = datastore.get(parcelKey);

        if(parcel != null){
            return Response.status(Response.Status.CONFLICT).entity("Parcel with name already exists.").build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey)
                        .set("parcel_id", parcelId)
                        .set("parcel_distrito", parcelInfo.distrito)
                        .set("parcel_concelho", parcelInfo.concelho)
                        .set("parcel_freguesia", parcelInfo.freguesia)
                        .build();

            txn.add(parcel);
            txn.commit();
            LOG.info("Parcel registered: " + parcelId);
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
            }
        }

        return Response.ok().build();
    }
}
