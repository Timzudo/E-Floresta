package firstwebapp.resources;

import com.google.cloud.datastore.*;
import com.google.cloud.storage.*;
import com.google.cloud.storage.Blob;
import com.google.gson.Gson;
import com.ibm.websphere.jaxrs20.multipart.IAttachment;
import firstwebapp.util.*;
import org.glassfish.jersey.media.multipart.FormDataParam;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Path("/parcel")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class ParcelResource {

    private static final Logger LOG = Logger.getLogger(ParcelResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    Storage storage = StorageOptions.newBuilder().setProjectId("moonlit-oven-349523").build().getService();

    private static final String PARCEL_BUCKET = "parcel_bucket";
    private static final String PARCEL_DOCUMENT_BUCKET = "parcel_document_bucket";
    private static final String PARCEL_PHOTO_BUCKET = "parcel_photo_bucket";


    private final Gson g = new Gson();

    @POST
    @Path("/register")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response registerParcel(@QueryParam("token") String token,
                                   @FormDataParam("name") String name,
                                   @FormDataParam("distrito") String distrito,
                                   @FormDataParam("concelho") String concelho,
                                   @FormDataParam("freguesia") String freguesia,
                                   @FormDataParam("photo") InputStream photo,
                                   @FormDataParam("coordinates") String coordinates,
                                   @FormDataParam("area") String area,
                                   @FormDataParam("perimeter") String perimeter) throws IOException {

        LOG.fine("Attempt to register parcel.");

        Point[] coordinateList = g.fromJson(coordinates, Point[].class);

        if(!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  &&/* document != null &&*/ !coordinates.equals("")  && !(coordinateList.length >= 3)){
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

        String parcelId = username + "_" + name;


        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelId);
        Entity parcel = datastore.get(parcelKey);

        if(parcel != null){
            return Response.status(Response.Status.CONFLICT).entity("Parcel with name already exists.").build();
        }

        //Bucket bucket = storage.create(BucketInfo.of(PARCEL_BUCKET));
        BlobId blobId = BlobId.of(PARCEL_BUCKET, username + "/" + parcelId + "_coordinates");
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
        storage.create(blobInfo, coordinates.getBytes(StandardCharsets.UTF_8));

        BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
        storage.create(blobInfoPhoto, photo);

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey)
                        .set("parcel_name", name)
                        .set("parcel_distrito", distrito)
                        .set("parcel_concelho", concelho)
                        .set("parcel_freguesia", freguesia)
                        .set("parcel_owner", username)
                        .set("parcel_area", area)
                        .set("parcel_perimeter", perimeter)
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

        /*parcelListQuery.forEachRemaining( p -> {

            String path = username + "/" + username + "_" + p.getString("parcel_name");
            System.out.println(path);
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");

            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);
            System.out.println(coordinatesString);
            Point[] coordinateList = g.fromJson(coordinatesString, Point[].class);

            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path+"_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelInfo(p.getString("parcel_name"), coordinateList, p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getLong("parcel_area"),
                    p.getLong("parcel_perimeter"),
                    photo));

        });*/

        return Response.ok(g.toJson(parcelList)).build();
    }

}
