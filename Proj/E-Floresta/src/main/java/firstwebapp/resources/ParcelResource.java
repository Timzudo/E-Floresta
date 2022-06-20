package firstwebapp.resources;

import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.datastore.*;
import com.google.cloud.storage.*;
import com.google.cloud.storage.Blob;
import com.google.gson.Gson;
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
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Path("/parcel")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class ParcelResource {

    public static final String SYS_ADMIN_ROLE = "A";
    public static final String MODERATOR_ROLE = "B";

    private static final Logger LOG = Logger.getLogger(ParcelResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    Credentials credentials = GoogleCredentials.getApplicationDefault();
    Storage storage = StorageOptions.newBuilder().setProjectId("moonlit-oven-349523").setCredentials(credentials).build().getService();

    private static final String PARCEL_BUCKET = "parcel_bucket";
    private static final String PARCEL_DOCUMENT_BUCKET = "parcel_document_bucket";
    private static final String PARCEL_PHOTO_BUCKET = "parcel_photo_bucket";


    private final Gson g = new Gson();

    public ParcelResource() throws IOException {
    }

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
                                   @FormDataParam("perimeter") String perimeter) {

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

        long areaLong = Long.parseLong(area);
        long perimeterLong = Long.parseLong(perimeter);

        try{
            parcel = Entity.newBuilder(parcelKey)
                        .set("parcel_name", name)
                        .set("parcel_distrito", distrito)
                        .set("parcel_concelho", concelho)
                        .set("parcel_freguesia", freguesia)
                        .set("parcel_owner", username)
                        .set("parcel_manager", "")
                        .set("parcel_area", areaLong)
                        .set("parcel_perimeter", perimeterLong)
                        .set("parcel_state", "PENDING")
                        .build();

            txn.add(parcel);
            txn.commit();
            LOG.info("Parcel registered: " + parcelId);
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
    @Path("/managed")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getManaged(TokenData tokenData) {
        LOG.fine("Attempt to register parcel.");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null || !tokenInfo.role.equals("C")){
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
                .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", username))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();

        parcelListQuery.forEachRemaining( p -> {

            String parcelName = p.getString("parcel_name");

            String path = username + "/" + username + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");

            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                                                p.getString("parcel_distrito"),
                                                p.getString("parcel_concelho"),
                                                p.getString("parcel_fregkuesia"),
                                                p.getString("parcel_state").equals("APPROVED"),
                                                p.getLong("parcel_area"),
                                                p.getLong("parcel_perimeter"),
                                                url,
                                                coordinatesString));
        });

        return Response.ok(g.toJson(parcelList)).build();
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
                .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", username))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();

        parcelListQuery.forEachRemaining( p -> {

            String parcelName = p.getString("parcel_name");
            String path = username + "/" + username + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_state").equals("APPROVED"),
                    p.getLong("parcel_area"),
                    p.getLong("parcel_perimeter"),
                    url,
                    coordinatesString));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }



    @POST
    @Path("/parcelInfo")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getParcelInfo(@QueryParam("parcelName") String parcelName, TokenData tokenData) {
        LOG.fine("Attempt to get parcel info of:" + parcelName);

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).entity("Parcel with name not found.").build();
        }

        String path = username + "/" + username + "_" + parcelName;
        Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
        byte[] coordinates = blob.getContent();
        String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

        ParcelInfo info = new ParcelInfo(parcelName,
                                            parcel.getString("parcel_distrito"),
                                            parcel.getString("parcel_concelho"),
                                            parcel.getString("parcel_freguesia"),
                                            parcel.getLong("parcel_area"),
                                            parcel.getLong("parcel_perimeter"),
                                            coordinatesString,
                                            parcel.getString("parcel_owner"),
                                            parcel.getString("parcel_manager"));

        return Response.ok(g.toJson(info)).build();
    }

    @POST
    @Path("/addmanager/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addManager(@PathParam("parcelName") String parcelName, ManagerData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }
        //E onwer da parcela
        if(!parcel.getString("parcel_owner").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        //Ja tem manager
        if(!parcel.getString("parcel_manager").equals("")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        Key managerKey = datastore.newKeyFactory().setKind("User").newKey(data.managerName);
        Entity manager = datastore.get(managerKey);
        //Manager existe
        if(manager == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Manager with name not found.").build();
        }
        //Manager esta ativo e tem role
        if(!manager.getString("user_state").equals("ACTIVE") || !manager.getString("user_role").equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey).set("parcel_manager", data.managerName).build();

            txn.update(parcel);
            txn.commit();
            LOG.fine("Added manager: " + data.managerName + "to parcel: " + parcelName);
            return Response.ok("Manager added successfully.").build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }

    @POST
    @Path("/removemanager/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response removeManager(@PathParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);

        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey).set("parcel_manager", "").build();

            txn.update(parcel);
            txn.commit();
            return Response.ok("Manager added successfully.").build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }

    //Modify resources

    @POST
    @Path("/modify/{parcelName}/photo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response modifyParcelPhoto(@PathParam("parcelName") String parcelName,
                                         @FormDataParam("token") String token,
                                         @FormDataParam("photo") InputStream photo) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(!parcel.getString("parcel_owner").equals(username) && !role.equals(MODERATOR_ROLE) && !role.equals(SYS_ADMIN_ROLE)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String parcelId = username + "_" + parcelName;
        BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
        storage.create(blobInfoPhoto, photo);

        return Response.ok().build();
    }


    @POST
    @Path("/modify/{parcelName}/document")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response modifyParcelDocument(@PathParam("parcelName") String parcelName,
                                      @FormDataParam("token") String token,
                                      @FormDataParam("document") InputStream document) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username) && !role.equals(MODERATOR_ROLE) && !role.equals(SYS_ADMIN_ROLE)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String parcelId = username + "_" + parcelName;
        BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
        storage.create(blobInfoDocument, document);

        return Response.ok().build();
    }


    @POST
    @Path("/modify/{parcelName}/coordinates")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response modifyParcelCoordinates(@PathParam("parcelName") String parcelName,
                                            @FormDataParam("token") String token,
                                            @FormDataParam("coordinates") String coordinates,
                                            @FormDataParam("area") String area,
                                            @FormDataParam("perimeter") String perimeter) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Point[] coordinateList = g.fromJson(coordinates, Point[].class);
        if(coordinateList.length>3){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username) && !role.equals(MODERATOR_ROLE) && !role.equals(SYS_ADMIN_ROLE)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String parcelId = username + "_" + parcelName;
        BlobId blobId = BlobId.of(PARCEL_BUCKET, username + "/" + parcelId + "_coordinates");
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
        storage.create(blobInfo, coordinates.getBytes(StandardCharsets.UTF_8));


        Transaction txn = datastore.newTransaction();
        try{
            parcel = Entity.newBuilder(parcelKey)
                    .set("parcel_area", Long.parseLong(area))
                    .set("parcel_perimeter", Long.parseLong(perimeter))
                    .build();

            txn.update(parcel);
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
    @Path("/nearby")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response getParcelsNearby(@QueryParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(!parcel.getString("parcel_owner").equals(username) && !role.equals(MODERATOR_ROLE) && !role.equals(SYS_ADMIN_ROLE)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String freguesia = parcel.getString("parcel_freguesia");

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<String> parcelList = new ArrayList<>();

        parcelListQuery.forEachRemaining( p -> {

            String path = username + "/" + username + "_" + p.getString("parcel_name");
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            parcelList.add(coordinatesString);
        });

        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/modify/{parcelName}/info")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response modifyParcelInfo(@PathParam("parcelName") String parcelName, ParcelData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username) && !role.equals(MODERATOR_ROLE) && !role.equals(SYS_ADMIN_ROLE)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcelKey)
                    .set("parcel_distrito", data.distrito)
                    .set("parcel_concelho", data.concelho)
                    .set("parcel_freguesia", data.freguesia)
                    .build();

            txn.update(parcel);
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
