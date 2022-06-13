package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.cloud.storage.*;
import com.google.cloud.storage.Blob;
import com.google.gson.Gson;
import firstwebapp.util.*;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Path("/parcel")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class ParcelResource {

    private static final Logger LOG = Logger.getLogger(ParcelResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    Storage storage = StorageOptions.newBuilder().setProjectId("moonlit-oven-349523").build().getService();

    private static final String PARCEL_BUCKET = "parcel_bucket";


    private final Gson g = new Gson();

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerParcel(@QueryParam("token") String token, ParcelRegistrationData parcelInfo){
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

        String parcelId = username + "_" + parcelInfo.name;

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelId);
        Entity parcel = datastore.get(parcelKey);

        if(parcel != null){
            return Response.status(Response.Status.CONFLICT).entity("Parcel with name already exists.").build();
        }

        //Bucket bucket = storage.create(BucketInfo.of(PARCEL_BUCKET));
        BlobId blobId = BlobId.of(PARCEL_BUCKET, username + "/" + parcelId + "_coordinates");
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
        storage.create(blobInfo, g.toJson(parcelInfo.coordinates).getBytes(StandardCharsets.UTF_8));

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey)
                        .set("parcel_name", parcelInfo.name)
                        .set("parcel_distrito", parcelInfo.distrito)
                        .set("parcel_concelho", parcelInfo.concelho)
                        .set("parcel_freguesia", parcelInfo.freguesia)
                        .set("parcel_owner", username)
                        .set("parcel_area", parcelInfo.area)
                        .set("parcel_perimeter", parcelInfo.perimeter)
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

    @POST
    @Path("/owned")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getOwned(TokenData tokenData) {

        LOG.fine("Attempt to register parcel.");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }


        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(StructuredQuery.PropertyFilter.ge("parcel_owner", username))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelInfo> parcelList = new ArrayList<>();

        parcelListQuery.forEachRemaining( p -> {


            String path = username + "/" + p.getString("parcel_name") + "_coordinates";
            Blob blob = storage.get(PARCEL_BUCKET, path);
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);
            Point[] coordinateList = g.fromJson(coordinatesString, Point[].class);

            parcelList.add(new ParcelInfo(p.getString("parcel_name"), coordinateList, p.getString("parcel_distrito"),
                                            p.getString("parcel_concelho"),
                                            p.getString("parcel_freguesia"),
                                            p.getLong("parcel_area"),
                                            p.getLong("parcel_perimeter")));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }

}
