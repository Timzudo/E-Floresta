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
    @Path("/getCSV")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces("text/plain; charset=utf-8")
    public Response getCSV(TokenData data){
        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Blob blob = storage.get("efloresta_util", "freguesias.txt");

        byte[] csvContent = blob.getContent();
        String csvString = new String(csvContent, StandardCharsets.UTF_8);

        return Response.ok(csvString).build();
    }


    @POST
    @Path("/register")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response registerParcel(@FormDataParam("token") String token,
                                   @FormDataParam("name") String name,
                                   @FormDataParam("distrito") String distrito,
                                   @FormDataParam("concelho") String concelho,
                                   @FormDataParam("freguesia") String freguesia,
                                   @FormDataParam("photo") InputStream photo,
                                   @FormDataParam("coordinates") String coordinates,
                                   @FormDataParam("area") String area,
                                   @FormDataParam("perimeter") String perimeter,
                                   @FormDataParam("document") InputStream document,
                                   @FormDataParam("usage") String usage,
                                   @FormDataParam("oldUsage") String oldUsage) {

        LOG.fine("Attempt to register parcel.");

        Point[] coordinateList = g.fromJson(coordinates, Point[].class);

        if(!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  && document != null && photo != null && !coordinates.equals("")  && !(coordinateList.length >= 3)){
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

        BlobId blobId = BlobId.of(PARCEL_BUCKET, username + "/" + parcelId + "_coordinates");
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
        storage.create(blobInfo, coordinates.getBytes(StandardCharsets.UTF_8));

        BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
        storage.create(blobInfoPhoto, photo);

        BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, username + "/" + parcelId + "_document");
        BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
        storage.create(blobInfoDocument, document);

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
                        .set("parcel_requested_manager", "")
                        .set("parcel_area", areaLong)
                        .set("parcel_perimeter", perimeterLong)
                        .set("parcel_state", "PENDING")
                        .set("parcel_usage", usage)
                        .set("parcel_old_usage", oldUsage)
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
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state").equals("APPROVED"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });
        return Response.ok(g.toJson(parcelList)).build();
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


        Entity p;

        while(parcelListQuery.hasNext()){
            p = parcelListQuery.next();

            String parcelName = p.getString("parcel_name");

            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");

            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state").equals("APPROVED"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        }

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_owner").equals(username) && !parcel.getString("parcel_manager").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).entity("Parcel with name not found.").build();
        }

        String path = username + "/" + parcelName;
        Blob blobDocument = storage.get(PARCEL_DOCUMENT_BUCKET, path + "_document");
        URL url = blobDocument.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

        ParcelInfo info = new ParcelInfo(url.toString(),
                parcel.getString("parcel_usage"),
                parcel.getString("parcel_old_usage"));

        return Response.ok(g.toJson(info)).build();
    }



    @POST
    @Path("/sendrequest/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sendRequest(@PathParam("parcelName") String parcelName, ManagerData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null || !tokenInfo.role.equals("D")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;


        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }
        //E onwer da parcela
        if(!parcel.getString("parcel_owner").equals(username) || !parcel.getString("parcel_state").equals("APPROVED")){
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
        if(!manager.getString("user_state").equals("ACTIVE") || !manager.getString("user_role").equals("C") ||
                (!manager.getString("user_concelho").equals(parcel.getString("parcel_concelho")) && !manager.getString("user_freguesia").equals(parcel.getString("parcel_freguesia")))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel).set("parcel_requested_manager", managerKey.getName()).build();

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
    @Path("/acceptrequest/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response acceptParcelRequest(@PathParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null || !tokenInfo.role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        //Ja tem manager
        if(!parcel.getString("parcel_manager").equals("")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if(!parcel.getString("parcel_requested_manager").equals(username)){
            return Response.status(Response.Status.NOT_FOUND).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_manager", username)
                    .set("parcel_requested_manager", "")
                    .build();

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


    @POST
    @Path("/rejectrequest/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rejectRequest(@PathParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null || !tokenInfo.role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        //Ja tem manager
        if(!parcel.getString("parcel_manager").equals("")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if(!parcel.getString("parcel_requested_manager").equals(username)){
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_requested_manager", "")
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

        if(!user.getString("user_state").equals("ACTIVE") || (!tokenInfo.role.equals("C") || !tokenInfo.role.equals("D"))){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_manager").equals(username) && !parcel.getString("parcel_owner").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_manager", "")
                    .build();

            txn.update(parcel);
            txn.commit();
            return Response.ok("Manager removed successfully.").build();
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
        if((role.equals("B1") && !user.getString("user_concelho").equals(parcel.getString("parcel_concelho"))) ||
                (role.equals("B2") && !user.getString("user_freguesia").equals(parcel.getString("parcel_freguesia"))) ||
                (role.equals("D") && !parcel.getString("parcel_owner").equals(username)) ||
                (role.equals("C"))){
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        String role = user.getString("user_role");
        if((role.equals("B1") && !user.getString("user_concelho").equals(parcel.getString("parcel_concelho"))) ||
                (role.equals("B2") && !user.getString("user_freguesia").equals(parcel.getString("parcel_freguesia"))) ||
                (role.equals("D") && !parcel.getString("parcel_owner").equals(username)) ||
                (role.equals("C"))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String parcelId = username + "_" + parcelName;
        BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
        storage.create(blobInfoDocument, document);

        return Response.ok().build();
    }


    @POST
    @Path("/nearby")
    @Consumes(MediaType.APPLICATION_JSON)
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(username+"_"+parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        String role = user.getString("user_role");
        if((role.equals("B1") && !user.getString("user_concelho").equals(parcel.getString("parcel_concelho"))) ||
           ((role.equals("B2") && !user.getString("user_freguesia").equals(parcel.getString("parcel_freguesia"))) ||
           (role.equals("C") && !parcel.getString("parcel_manager").equals(username)) ||
           (role.equals("D") && !parcel.getString("parcel_owner").equals(username)))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String freguesia = parcel.getString("parcel_freguesia");

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia),
                            StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED")))
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        String role = user.getString("user_role");
        if((role.equals("B1") && !user.getString("user_concelho").equals(parcel.getString("parcel_concelho"))) ||
           (role.equals("B2") && !user.getString("user_freguesia").equals(parcel.getString("parcel_freguesia"))) ||
           (role.equals("D") && !parcel.getString("parcel_owner").equals(username)) ||
           (role.equals("C"))){
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
    @Path("/modify/{parcelName}/info")
    @Consumes(MediaType.APPLICATION_JSON)
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




    @POST
    @Path("/managers")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getManagers(TokenData tokenData) {
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }


        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("User")
                .setFilter(StructuredQuery.PropertyFilter.eq("user_role", "C"))
                .build();

        QueryResults<Entity> managerListQuery = datastore.run(query);

        List<String> managerList = new ArrayList<>();


        Entity u;

        while(managerListQuery.hasNext()){
            u = managerListQuery.next();

            managerList.add(u.getKey().getName());
        }

        return Response.ok(g.toJson(managerList)).build();
    }

    @POST
    @Path("/availablemanagers/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAvailableManagers(@PathParam("parcelName") String parcelName, TokenData tokenData) {
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }


        Query<Entity> queryFreguesia = Query.newEntityQueryBuilder()
                .setKind("User")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("user_role", "C"),
                        StructuredQuery.PropertyFilter.eq("user_freguesia", parcel.getString("parcel_freguesia"))))
                .build();

        Query<Entity> queryConcelho = Query.newEntityQueryBuilder()
                .setKind("User")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("user_role", "C"),
                        StructuredQuery.PropertyFilter.eq("user_concelho", parcel.getString("parcel_concelho"))))
                .build();

        QueryResults<Entity> managerListFreguesiaQuery = datastore.run(queryFreguesia);
        QueryResults<Entity> managerListConcelhoQuery = datastore.run(queryConcelho);

        List<String> managerList = new ArrayList<>();


        managerListFreguesiaQuery.forEachRemaining(u -> managerList.add(u.getKey().getName()));
        managerListConcelhoQuery.forEachRemaining(u -> managerList.add(u.getKey().getName()));

        return Response.ok(g.toJson(managerList)).build();
    }



    @POST
    @Path("/requested")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRequested(TokenData data) {
        LOG.fine("Attempt to register parcel.");


        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null || !tokenInfo.role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("ParcelRequest")
                .setFilter(StructuredQuery.PropertyFilter.eq("parcel_requested_manager", username))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        Entity u;

        while(parcelListQuery.hasNext()){
            u = parcelListQuery.next();

            Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(u.getString("parcel_name"));
            Entity parcel = datastore.get(parcelKey);

            String parcelName = parcel.getString("parcel_name");
            String owner = parcel.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcel.getString("parcel_name"),
                    parcel.getString("parcel_freguesia"),
                    parcel.getString("parcel_owner"),
                    parcel.getString("parcel_manager"),
                    parcel.getString("parcel_state").equals("APPROVED"),
                    url,
                    coordinatesString,
                    parcel.getLong("parcel_area")));
        }

        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/pendingbyregion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPendingByRegion(TokenData data) {
        LOG.fine("Attempt to register parcel.");


        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null || !tokenInfo.role.contains("B")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        StructuredQuery.PropertyFilter filter;

        if(tokenInfo.role.equals("B1")){
            filter = StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"));
        }
        else{
            filter = StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"));
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("ParcelRequest")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_manager", username), filter))
                .build();


        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        Entity u;

        while(parcelListQuery.hasNext()){
            u = parcelListQuery.next();

            Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(u.getString("parcel_name"));
            Entity parcel = datastore.get(parcelKey);

            String parcelName = parcel.getString("parcel_name");
            String owner = parcel.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcel.getString("parcel_name"),
                    parcel.getString("parcel_freguesia"),
                    parcel.getString("parcel_owner"),
                    parcel.getString("parcel_manager"),
                    parcel.getString("parcel_state").equals("APPROVED"),
                    url,
                    coordinatesString,
                    parcel.getLong("parcel_area")));
        }

        return Response.ok(g.toJson(parcelList)).build();
    }


    @POST
    @Path("/approve/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response approveParcel(@PathParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null || !tokenInfo.role.contains("B")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        //Ja tem manager
        if(!parcel.getString("parcel_state").equals("PENDING")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if((tokenInfo.role.equals("C1") && !parcel.getString("parcel_concenlho").equals(user.getString("user_concelho"))) ||
                (tokenInfo.role.equals("C2") && !parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia")))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_state", "APPROVED")
                    .build();

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

    @POST
    @Path("/reject/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rejectParcel(@PathParam("parcelName") String parcelName, TokenData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        //Token valido
        if(tokenInfo == null || !tokenInfo.role.contains("B")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        //Owner existe
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        //Ja tem manager
        if(!parcel.getString("parcel_state").equals("PENDING")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if((tokenInfo.role.equals("C1") && !parcel.getString("parcel_concenlho").equals(user.getString("user_concelho"))) ||
                (tokenInfo.role.equals("C2") && !parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia")))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_state", "REJECTED")
                    .build();

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

    @POST
    @Path("/delete/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response deleteParcel(@PathParam("parcelName") String parcelName, TokenData data) {
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if((tokenInfo.role.equals("C1") && !parcel.getString("parcel_concenlho").equals(user.getString("user_concelho"))) ||
                (tokenInfo.role.equals("C2") && !parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))) ||
                (tokenInfo.role.equals("D") && !parcel.getString("parcel_freguesia").equals(username)) ||
                (tokenInfo.role.equals("C"))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            txn.delete(parcelKey);
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



    //change usage
    /*Comparator<Entry<String, Integer>> valueComparatorInt = new Comparator<Entry<String,Integer>>() {
    	@Override public int compare(Entry<String, Integer> e1, Entry<String, Integer> e2) { 
    		int v1 = e1.getValue(); 
    		int v2 = e2.getValue(); 
    		int res = 0;
    		
    		if(v2 < v1)
    			res = -1;
    		else if(v2 > v1)
    			res = 1;
    		
    		return res;
    	} 
    };
    
    Comparator<Entry<String, Long>> valueComparatorLong = new Comparator<Entry<String,Long>>() { 
    	@Override public int compare(Entry<String, Long> e1, Entry<String, Long> e2) { 
    		Long v1 = e1.getValue(); 
    		Long v2 = e2.getValue(); 
    		int res = 0;
    		
    		if(v2 < v1)
    			res = -1;
    		else if(v2 > v1)
    			res = 1;
    		
    		return res;
    	} 
    };
	
    // method to get list of users and the number of parcels they own, for use in ranking
    
    @POST
    @Path("/ranking/byOwned")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getRankingByOwned( TokenData data ) {
        LOG.fine("Attempt to get users ranking by number of owned parcels: ");

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

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .build();

        QueryResults<Entity> allParcels = datastore.run(query);

        // ownerList -> mapa do tipo < OwnerName, nOfParcelsOwned > para efetuar o ranking
        
        Map<String,Integer> ownerList = new HashMap<String,Integer>();

        allParcels.forEachRemaining( p -> {

            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            
            if(ownerList.containsKey(owner)) {
            	int count = ownerList.get(owner);
            	count += 1;
            	ownerList.put(owner, count);
            }
            else {
            	ownerList.put(owner, 1);
            }
            
        });
        
        // sorting users, by number of owned parcels
        
        Set<Entry<String,Integer>> entries = ownerList.entrySet();
        List<Entry<String,Integer>> ownerListSorted = new ArrayList<Entry<String,Integer>>(entries);
        Collections.sort(ownerListSorted, valueComparatorInt);
        
        return Response.ok(g.toJson(ownerListSorted)).build();
    }
    
    // method to get list of users and the number of parcels they manage, for use in ranking
    
    @POST
    @Path("/ranking/byManaged")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getRankingByManaged( TokenData data ) {
        LOG.fine("Attempt to get users ranking by number of parcels they manage: ");

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

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .build();

        QueryResults<Entity> allParcels = datastore.run(query);

        // ownerList -> mapa do tipo < ManagerName, nOfParcelsManaged > para efetuar o ranking
        
        Map<String,Integer> managerList = new HashMap<String,Integer>();

        allParcels.forEachRemaining( p -> {

            String parcelName = p.getString("parcel_name");
            String manager = p.getString("parcel_manager");
            
            if(managerList.containsKey(manager)) {
            	int count = managerList.get(manager);
            	count += 1;
            	managerList.put(manager, count);
            }
            else {
            	managerList.put(manager, 1);
            }
            
        });

        // sorting users, by number of managed parcels
        
        Set<Entry<String,Integer>> entries = managerList.entrySet();
        List<Entry<String,Integer>> managerListSorted = new ArrayList<Entry<String,Integer>>(entries);
        Collections.sort(managerListSorted, valueComparatorInt);
        
        return Response.ok(g.toJson(managerListSorted)).build();
    }
    
    // method to get list of users and their total owned area, for use in ranking
    
    @POST
    @Path("/ranking/byArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getRankingByArea( TokenData data ) {
        LOG.fine("Attempt to get users ranking by total area of all owned parcels: ");

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

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .build();

        QueryResults<Entity> allParcels = datastore.run(query);

        // ownerList -> mapa do tipo < OwnerName, totalAreaOwned > para efetuar o ranking
        
        Map<String,Long> listByArea = new HashMap<String,Long>();

        allParcels.forEachRemaining( p -> {

            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            Long area = p.getLong("parcel_area");
            
            if(listByArea.containsKey(owner)) {
            	Long totalArea = listByArea.get(owner);
            	totalArea += area;
            	listByArea.put(owner, totalArea);
            }
            else {
            	listByArea.put(owner, area);
            }
            
        });
        
        // sort users in order of total owned area
        
        Set<Entry<String,Long>> entries = listByArea.entrySet();
        List<Entry<String,Long>> areaListSorted = new ArrayList<Entry<String,Long>>(entries);
        Collections.sort(areaListSorted, valueComparatorLong);

        return Response.ok(g.toJson(areaListSorted)).build();
    }*/
    
}



