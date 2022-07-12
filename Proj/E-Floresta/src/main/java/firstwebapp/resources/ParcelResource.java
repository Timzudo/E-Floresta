package firstwebapp.resources;

import com.google.appengine.api.memcache.stdimpl.GCacheFactory;
import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.datastore.*;
import com.google.cloud.storage.*;
import com.google.cloud.storage.Blob;
import com.google.common.io.ByteStreams;
import com.google.gson.Gson;
import firstwebapp.util.*;
import firstwebapp.util.Point;
import org.apache.http.client.entity.EntityBuilder;
import org.glassfish.jersey.media.multipart.FormDataParam;

import javax.cache.Cache;
import javax.cache.CacheException;
import javax.cache.CacheFactory;
import javax.cache.CacheManager;
import javax.imageio.ImageIO;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
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
    private static final String PARCEL_THUMBNAIL_BUCKET = "parcel_thumbnail_bucket";

    private final Gson g = new Gson();

    public ParcelResource() throws IOException {
    }

    private int getArea(Point[] points){
        double area = 0;

        for(int i = 0; i<points.length; i++){
            Point p1 = points[i];
            Point p2 = points[i+1];
            area += ConvertToRadian(p2.lng - p1.lng) * (2 + Math.sin(ConvertToRadian(p1.lat)) + Math.sin(ConvertToRadian(p2.lat)));
        }

        return (int)area;
    }

    private static double ConvertToRadian(double input)
    {
        return input * Math.PI / 180;
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
                                   @FormDataParam("document") InputStream document,
                                   @FormDataParam("usage") String usage,
                                   @FormDataParam("oldUsage") String oldUsage,
                                   @FormDataParam("cover") String cover) throws IOException {

        LOG.fine("Attempt to register parcel.");

        Point[] coordinateList = g.fromJson(coordinates, Point[].class);

        if(!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  && document != null && photo != null && !coordinates.equals("")  && !(coordinateList.length >= 3) &&
            !usage.equals("") && !oldUsage.equals("") && !cover.equals("")){
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
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        if(!user.getString("user_role").equals("D")){
            return Response.status(Response.Status.FORBIDDEN).build();
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

        byte[] bytes = ByteStreams.toByteArray(photo);

        ByteArrayInputStream isThumbnail = new ByteArrayInputStream(bytes);

        BufferedImage img = new BufferedImage(238, 200, BufferedImage.TYPE_INT_RGB);
        img.createGraphics().drawImage(ImageIO.read(isThumbnail).getScaledInstance(238, 200, Image.SCALE_SMOOTH),0,0,null);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ImageIO.write(img, "png", os);
        InputStream is = new ByteArrayInputStream(os.toByteArray());

        BlobId blobIdThumbnail = BlobId.of(PARCEL_THUMBNAIL_BUCKET, username + "/" + parcelId + "_thumbnail");
        BlobInfo blobInfoThumbnail = BlobInfo.newBuilder(blobIdThumbnail).setContentType("image/png").build();
        storage.create(blobInfoThumbnail, is);

        ByteArrayInputStream isPhoto = new ByteArrayInputStream(bytes);
        BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, username + "/" + parcelId + "_photo");
        BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
        storage.create(blobInfoPhoto, isPhoto);

        BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, username + "/" + parcelId + "_document");
        BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
        storage.create(blobInfoDocument, document);

        Transaction txn = datastore.newTransaction();

        long areaLong = getArea(coordinateList);

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
                        .set("parcel_state", "PENDING")
                        .set("parcel_usage", usage)
                        .set("parcel_old_usage", oldUsage)
                        .set("parcel_cover", cover)
                        .set("parcel_description", "")
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
    @Path("/registerAdmin")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response registerParcelAdmin(@FormDataParam("token") String token,
                                       @FormDataParam("owner") String owner,
                                       @FormDataParam("name") String name,
                                       @FormDataParam("distrito") String distrito,
                                       @FormDataParam("concelho") String concelho,
                                       @FormDataParam("freguesia") String freguesia,
                                       @FormDataParam("photo") InputStream photo,
                                       @FormDataParam("coordinates") String coordinates,
                                       @FormDataParam("document") InputStream document,
                                       @FormDataParam("usage") String usage,
                                       @FormDataParam("oldUsage") String oldUsage,
                                       @FormDataParam("cover") String cover) throws IOException {

            LOG.fine("Attempt to register parcel.");

            Point[] coordinateList = g.fromJson(coordinates, Point[].class);

        if(!name.equals("") && !distrito.equals("")  && !concelho.equals("")  && !freguesia.equals("")  && document != null && photo != null && !coordinates.equals("")  && !(coordinateList.length >= 3) &&
                !usage.equals("") && !oldUsage.equals("") && !cover.equals("")){
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
            if(!user.getString("user_state").equals("ACTIVE")){
                return Response.status(Response.Status.FORBIDDEN).build();
            }
            String role = user.getString("user_role");

            if(!role.contains("A") && !role.contains("B")){
                return Response.status(Response.Status.FORBIDDEN).build();
            }

            if(role.contains("B")){
                if(!distrito.equals(user.getString("user_distrito")) || !concelho.equals(user.getString("user_concelho"))){
                    return Response.status(Response.Status.FORBIDDEN).build();
                }
                if(role.equals("B2")){
                    if(!freguesia.equals(user.getString("user_freguesia"))){
                        return Response.status(Response.Status.FORBIDDEN).build();
                    }
                }
            }

            Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(owner);
            Entity ownerUser = datastore.get(ownerKey);

            if(ownerUser == null){
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            if(!ownerUser.getString("user_role").equals("D")){
                return Response.status(Response.Status.FORBIDDEN).build();
            }

            String parcelId = owner + "_" + name;
            Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelId);
            Entity parcel = datastore.get(parcelKey);

            if(parcel != null){
                return Response.status(Response.Status.CONFLICT).entity("Parcel with name already exists.").build();
            }

            BlobId blobId = BlobId.of(PARCEL_BUCKET, owner + "/" + parcelId + "_coordinates");
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
            storage.create(blobInfo, coordinates.getBytes(StandardCharsets.UTF_8));

            byte[] bytes = ByteStreams.toByteArray(photo);

            ByteArrayInputStream isThumbnail = new ByteArrayInputStream(bytes);

            BufferedImage img = new BufferedImage(238, 200, BufferedImage.TYPE_INT_RGB);
            img.createGraphics().drawImage(ImageIO.read(isThumbnail).getScaledInstance(238, 200, Image.SCALE_SMOOTH),0,0,null);
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(img, "png", os);
            InputStream is = new ByteArrayInputStream(os.toByteArray());

            BlobId blobIdThumbnail = BlobId.of(PARCEL_THUMBNAIL_BUCKET, owner + "/" + parcelId + "_thumbnail");
            BlobInfo blobInfoThumbnail = BlobInfo.newBuilder(blobIdThumbnail).setContentType("image/png").build();
            storage.create(blobInfoThumbnail, is);

            ByteArrayInputStream isPhoto = new ByteArrayInputStream(bytes);
            BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, owner + "/" + parcelId + "_photo");
            BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
            storage.create(blobInfoPhoto, isPhoto);

            BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, owner + "/" + parcelId + "_document");
            BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
            storage.create(blobInfoDocument, document);

            Transaction txn = datastore.newTransaction();

            long areaLong = getArea(coordinateList);

            try{
                parcel = Entity.newBuilder(parcelKey)
                            .set("parcel_name", name)
                            .set("parcel_distrito", distrito)
                            .set("parcel_concelho", concelho)
                            .set("parcel_freguesia", freguesia)
                            .set("parcel_owner", owner)
                            .set("parcel_manager", "")
                            .set("parcel_requested_manager", "")
                            .set("parcel_area", areaLong)
                            .set("parcel_state", "APPROVED")
                            .set("parcel_usage", usage)
                            .set("parcel_old_usage", oldUsage)
                            .set("parcel_cover", cover)
                            .set("parcel_description", "")
                            .build();

                ownerUser = Entity.newBuilder(ownerUser)
                                .set("user_total_parcel_area", user.getLong("user_total_parcel_area")+areaLong)
                                .set("user_parcel_count", user.getLong("user_parcel_count")+1)
                                .build();

                txn.add(parcel);
                txn.update(ownerUser);
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
        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").equals("D")){
            return Response.status(Response.Status.FORBIDDEN).build();
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
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
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
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }
        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);

        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }
        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
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
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
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
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }


        String role = user.getString("user_role");

        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C") && (!parcel.getString("parcel_manager").equals(username)) && (!parcel.getString("parcel_requested_manager").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String owner = parcel.getString("parcel_owner");

        String path = owner + "/" + parcelName;
        Blob blobDocument = storage.get(PARCEL_DOCUMENT_BUCKET, path + "_document");
        URL url = blobDocument.signUrl(6, TimeUnit.HOURS, Storage.SignUrlOption.withV4Signature());

        Blob blobPhoto = storage.get(PARCEL_PHOTO_BUCKET, path + "_photo");
        URL photourl = blobPhoto.signUrl(6, TimeUnit.HOURS, Storage.SignUrlOption.withV4Signature());

        ParcelInfo info = new ParcelInfo(url.toString(),
                                            photourl.toString(),
                                            parcel.getString("parcel_usage"),
                                            parcel.getString("parcel_old_usage"),
                                            parcel.getString("parcel_cover"),
                                            parcel.getString("parcel_description"),
                                            parcel.getString("parcel_requested_manager"));

        return Response.ok(g.toJson(info)).build();
    }



    @POST
    @Path("/sendrequest/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sendRequest(@PathParam("parcelName") String parcelName, ManagerData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

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
        String role = user.getString("user_role");
        if(!user.getString("user_state").equals("ACTIVE") || role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }
        if(!parcel.getString("parcel_state").equals("APPROVED")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        //Ja tem manager
        if(!parcel.getString("parcel_manager").equals("") || !parcel.getString("parcel_requested_manager").equals("")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Key managerKey = datastore.newKeyFactory().setKind("User").newKey(data.managerName);
        Entity manager = datastore.get(managerKey);
        //Manager existe
        if(manager == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Manager with name not found.").build();
        }
        //Manager esta ativo e tem role
        if(!manager.getString("user_state").equals("ACTIVE") || !manager.getString("user_role").equals("C") ||
                !manager.getString("user_concelho").equals(parcel.getString("parcel_concelho")) || !manager.getString("user_distrito").equals(parcel.getString("parcel_distrito"))){
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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").equals("C")){
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

        long area = parcel.getLong("parcel_area");

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_manager", username)
                    .set("parcel_requested_manager", "")
                    .build();

            user = Entity.newBuilder(parcel)
                    .set("user_total_parcel_area", user.getLong("user_total_parcel_area")+area)
                    .set("user_parcel_count", user.getLong("user_parcel_count")+1)
                    .build();

            txn.update(user);
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

        String role = user.getString("user_role");
        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        //Parcela existe
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_manager").equals("")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);

        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!parcel.getString("parcel_manager").equals(username) && !parcel.getString("parcel_owner").equals(username)){
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();
        }

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C") && (!parcel.getString("parcel_manager").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key managerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_manager"));
        Entity manager = datastore.get(managerKey);


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                        .set("parcel_manager", "")
                        .build();

            manager = Entity.newBuilder(manager)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area") - parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count") - 1)
                        .build();

            txn.update(manager);
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
                                         @FormDataParam("photo") InputStream photo) throws IOException {
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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        byte[] bytes = ByteStreams.toByteArray(photo);

        ByteArrayInputStream isThumbnail = new ByteArrayInputStream(bytes);

        BufferedImage img = new BufferedImage(238, 200, BufferedImage.TYPE_INT_RGB);
        img.createGraphics().drawImage(ImageIO.read(isThumbnail).getScaledInstance(238, 200, Image.SCALE_SMOOTH),0,0,null);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ImageIO.write(img, "png", os);
        InputStream is = new ByteArrayInputStream(os.toByteArray());

        BlobId blobIdThumbnail = BlobId.of(PARCEL_THUMBNAIL_BUCKET, parcel.getString("parcel_owner") + "/" + parcelName + "_thumbnail");
        BlobInfo blobInfoThumbnail = BlobInfo.newBuilder(blobIdThumbnail).setContentType("image/png").build();
        storage.create(blobInfoThumbnail, is);

        ByteArrayInputStream isPhoto = new ByteArrayInputStream(bytes);
        BlobId blobIdPhoto = BlobId.of(PARCEL_PHOTO_BUCKET, parcel.getString("parcel_owner") + "/" + parcelName + "_photo");
        BlobInfo blobInfoPhoto = BlobInfo.newBuilder(blobIdPhoto).setContentType("image/png").build();
        storage.create(blobInfoPhoto, isPhoto);

        if(role.equals("D")){
            Transaction txn = datastore.newTransaction();
            try{
                parcel = Entity.newBuilder(parcel)
                        .set("parcel_state", "PENDING")
                        .build();
                Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_owner"));
                Entity owner = datastore.get(ownerKey);
                owner = Entity.newBuilder(owner)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();

                txn.update(owner);
                txn.update(parcel);
                txn.commit();
            }
            finally {
                if(txn.isActive()){
                    txn.rollback();
                    return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
                }
            }
        }

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

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        BlobId blobIdDocument = BlobId.of(PARCEL_DOCUMENT_BUCKET, parcel.getString("parcel_owner") + "/" + parcelName + "_document");
        BlobInfo blobInfoDocument = BlobInfo.newBuilder(blobIdDocument).setContentType("application/pdf").build();
        storage.create(blobInfoDocument, document);

        if(role.equals("D")){
            Transaction txn = datastore.newTransaction();
            try{
                parcel = Entity.newBuilder(parcel)
                        .set("parcel_state", "PENDING")
                        .build();

                Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_owner"));
                Entity owner = datastore.get(ownerKey);
                owner = Entity.newBuilder(owner)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();

                txn.update(owner);
                txn.update(parcel);
                txn.commit();
            }
            finally {
                if(txn.isActive()){
                    txn.rollback();
                    return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
                }
            }
        }

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.contains("B")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        String freguesia = parcel.getString("parcel_freguesia");

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia),
                            StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED")))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<NearbyParcel> parcelList = new ArrayList<>();

        parcelListQuery.forEachRemaining( p -> {

            String nearbyParcelName = username + "_" + p.getString("parcel_name");
            String path = username + "/" + nearbyParcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            parcelList.add(new NearbyParcel(nearbyParcelName, coordinatesString));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }



    @POST
    @Path("/modify/{parcelName}/coordinates")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response modifyParcelCoordinates(@PathParam("parcelName") String parcelName,
                                            ModifyParcelCoordinatesData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(data.token);
        if(tokenInfo == null){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Point[] coordinateList = g.fromJson(data.coordinates, Point[].class);
        if(coordinateList.length < 3 || parcelName.equals("")){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        String username = tokenInfo.sub;
        Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
        Entity user = datastore.get(userKey);
        if(user == null){
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }



        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        BlobId blobId = BlobId.of(PARCEL_BUCKET, parcel.getString("parcel_owner") + "/" + parcelName + "_coordinates");
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
        storage.create(blobInfo, data.coordinates.getBytes(StandardCharsets.UTF_8));


        Transaction txn = datastore.newTransaction();
        Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_owner"));
        Entity owner = datastore.get(ownerKey);



        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_area", Long.parseLong(data.area))
                    .set("parcel_perimeter", Long.parseLong(data.perimeter))
                    .set("parcel_state", role.equals("D")?"PENDING":parcel.getString("parcel_state"))
                    .build();

            if(role.equals("D") && parcel.getString("parcel_state").equals("APPROVED")){
                owner = Entity.newBuilder(owner)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();
            }



            txn.update(owner);
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

        if(!data.isValid()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

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

        Key parcelKey = datastore.newKeyFactory().setKind("Parcel").newKey(parcelName);
        Entity parcel = datastore.get(parcelKey);
        if(parcel == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }

        if(!user.getString("user_state").equals("ACTIVE")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_cover", data.cover)
                    .set("parcel_usage", data.usage)
                    .set("parcel_old_usage", data.oldUsage)
                    .set("parcel_description", data.description)
                    .set("parcel_state", role.equals("D")?"PENDING":parcel.getString("parcel_state"))
                    .build();

            if(role.equals("D")){
                Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_owner"));
                Entity owner = datastore.get(ownerKey);

                owner = Entity.newBuilder(owner)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();
                txn.update(owner);
            }

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



    /*@POST
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
    }*/

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

        String role = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Query<Entity> queryConcelho = Query.newEntityQueryBuilder()
                .setKind("User")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("user_role", "C"),
                        StructuredQuery.PropertyFilter.eq("user_concelho", parcel.getString("parcel_concelho"))))
                .build();

        QueryResults<Entity> managerListConcelhoQuery = datastore.run(queryConcelho);

        List<String> managerList = new ArrayList<>();


        managerListConcelhoQuery.forEachRemaining(u -> managerList.add(u.getKey().getName()));

        return Response.ok(g.toJson(managerList)).build();
    }



    @POST
    @Path("/getrequested")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRequested(TokenData data) {
        LOG.fine("Attempt to register parcel.");


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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").equals("C")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_requested_manager", username),
                                                                StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED")))
                .build();

        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        parcelListQuery.forEachRemaining( p ->{

            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });
        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/pendingbyregion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPendingByRegion(TokenData data) {
        LOG.fine("Attempt to register parcel.");


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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").contains("B")){
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
                .setKind("Parcel")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "PENDING"),
                            StructuredQuery.PropertyFilter.eq("parcel_distrito", user.getString("user_distrito")), filter))
                .build();


        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        parcelListQuery.forEachRemaining(p ->{
            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/pendingbyregion/{distrito}/{concelho}/{freguesia}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPendingByRegionAdmin(@PathParam("distrito") String distrito, @PathParam("concelho") String concelho, @PathParam("freguesia") String freguesia, TokenData data) {
        LOG.fine("Attempt to register parcel.");


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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").contains("A")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        StructuredQuery.CompositeFilter filter;

        if(freguesia.equals("-")){
            filter = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "PENDING"),
                                                            StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                                                            StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho));
        }
        else{
            filter = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "PENDING"),
                    StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                    StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho),
                    StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia));
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(filter)
                .build();


        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        parcelListQuery.forEachRemaining(p ->{
            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/approvedbyregion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getApprovedParcelsByRegion(TokenData data) {
        LOG.fine("Attempt to register parcel.");


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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").contains("B")){
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
                .setKind("Parcel")
                .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED"),
                            StructuredQuery.PropertyFilter.eq("parcel_distrito", user.getString("user_distrito")), filter))
                .build();


        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        parcelListQuery.forEachRemaining(p ->{
            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }

    @POST
    @Path("/approvedbyregion/{distrito}/{concelho}/{freguesia}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getApprovedParcelsByRegionAdmin(@PathParam("distrito") String distrito, @PathParam("concelho") String concelho, @PathParam("freguesia") String freguesia, TokenData data) {
        LOG.fine("Attempt to register parcel.");


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

        if(!user.getString("user_state").equals("ACTIVE") || !user.getString("user_role").contains("A")){
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();
        }

        StructuredQuery.CompositeFilter filter;

        if(freguesia.equals("-")){
            filter = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED"),
                    StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                    StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho));
        }
        else{
            filter = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", "APPROVED"),
                    StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                    StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho),
                    StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia));
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Parcel")
                .setFilter(filter)
                .build();


        QueryResults<Entity> parcelListQuery = datastore.run(query);

        List<ParcelMiniature> parcelList = new ArrayList<>();


        parcelListQuery.forEachRemaining(p ->{
            String parcelName = p.getString("parcel_name");
            String owner = p.getString("parcel_owner");
            String path = owner + "/" + owner + "_" + parcelName;
            Blob blob = storage.get(PARCEL_BUCKET, path+"_coordinates");
            byte[] coordinates = blob.getContent();
            String coordinatesString = new String(coordinates, StandardCharsets.UTF_8);

            //TODO
            Blob blobPhoto = storage.get(PARCEL_THUMBNAIL_BUCKET, path + "_thumbnail");
            URL url = blobPhoto.signUrl(5, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

            parcelList.add(new ParcelMiniature(parcelName,
                    p.getString("parcel_distrito"),
                    p.getString("parcel_concelho"),
                    p.getString("parcel_freguesia"),
                    p.getString("parcel_owner"),
                    p.getString("parcel_manager"),
                    p.getString("parcel_state"),
                    url,
                    coordinatesString,
                    p.getLong("parcel_area")));
        });

        return Response.ok(g.toJson(parcelList)).build();
    }



    @POST
    @Path("/approve/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response approveParcel(@PathParam("parcelName") String parcelName, TokenData data) {
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

        //Ja tem manager
        if(!parcel.getString("parcel_state").equals("PENDING")){
            return Response.status(Response.Status.CONFLICT).build();
        }

        String role = user.getString("user_role");
        if(role.equals("D")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{
            parcel = Entity.newBuilder(parcel)
                    .set("parcel_state", "APPROVED")
                    .build();

            user = Entity.newBuilder(user)
                    .set("user_total_parcel_area", user.getLong("user_total_parcel_area")+parcel.getLong("parcel_area"))
                    .set("user_parcel_count", user.getLong("user_parcel_count")+1)
                    .build();

            txn.update(user);
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

        String role = user.getString("user_role");
        if(role.equals("D")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
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

        String role  = user.getString("user_role");
        if(role.equals("D") && (!parcel.getString("parcel_owner").equals(username))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!parcel.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!parcel.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!parcel.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }


        Transaction txn = datastore.newTransaction();

        try{


            if(!parcel.getString("parcel_manager").equals("")){
                Key managerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_manager"));
                Entity manager = datastore.get(managerKey);

                manager = Entity.newBuilder(manager)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();
                txn.update(manager);
            }
            if(parcel.getString("parcel_state").equals("ACTIVE")){
                Key ownerKey = datastore.newKeyFactory().setKind("User").newKey(parcel.getString("parcel_owner"));
                Entity owner = datastore.get(ownerKey);

                owner = Entity.newBuilder(owner)
                        .set("user_total_parcel_area", user.getLong("user_total_parcel_area")-parcel.getLong("parcel_area"))
                        .set("user_parcel_count", user.getLong("user_parcel_count")-1)
                        .build();
                txn.update(owner);
            }

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



    @POST
    @Path("/report/{parcelName}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sendReport(@PathParam("parcelName") String parcelName, ReportData data) {
        LOG.fine("Attempt to get add managers to: " + parcelName);

        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

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

        Key reportKey = datastore.newKeyFactory().setKind("Report").newKey(UUID.randomUUID().toString());

        Transaction txn = datastore.newTransaction();

        try{
            Entity report = Entity.newBuilder(reportKey)
                            .set("report_parcel_name", parcelKey.getName())
                            .set("report_sender", username)
                            .set("report_topic", data.topic)
                            .set("report_message", data.text)
                            .set("report_priority", user.getLong("user_trust"))
                            .set("report_distrito", parcel.getString("parcel_distrito"))
                            .set("report_concelho", parcel.getString("parcel_concelho"))
                            .set("report_freguesia", parcel.getString("parcel_freguesia"))
                            .build();

            txn.add(report);
            txn.commit();
            return Response.ok().build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }

    @POST
    @Path("/review/{reportID}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response reviewReport(@PathParam("reportID") String reportID, ReviewData data) {
        if(!data.isValid()){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

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

        Key reportKey = datastore.newKeyFactory().setKind("Report").newKey(reportID);
        Entity report = datastore.get(reportKey);
        if(report == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Parcel with name not found.").build();
        }


        String role = user.getString("user_role");
        if(role.equals("D")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("C")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B2") && ((!report.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!report.getString("parcel_concelho").equals(user.getString("user_concelho"))) || (!report.getString("parcel_freguesia").equals(user.getString("user_freguesia"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        else if(role.equals("B1") && ((!report.getString("parcel_distrito").equals(user.getString("user_distrito"))) ||
                (!report.getString("parcel_concelho").equals(user.getString("user_concelho"))))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Key senderKey = datastore.newKeyFactory().setKind("User").newKey(report.getString("report_sender"));
        Entity sender = datastore.get(senderKey);

        Transaction txn = datastore.newTransaction();


        try{
            if(sender != null){
                int change = 0;

                switch (data.opinion){
                    case "POSITIVE":
                        change += 1;
                        break;
                    case "NEGATIVE":
                        change -= 3;
                        break;
                }

                long trust = sender.getLong("user_trust");
                trust += change;
                if(trust > 200){
                    trust = 200;
                }
                else if(trust < 1){
                    trust = 1;
                }

                sender = Entity.newBuilder(sender)
                        .set("user_trust", trust)
                        .build();
                txn.update(sender);
            }



            txn.delete(reportKey);
            txn.commit();
            return Response.ok().build();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Internal error.").build();
            }
        }
    }


    @POST
    @Path("/getreportsAll")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getReports(TokenData data) {
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
        String role = user.getString("user_role");

        if(!role.contains("A") && !role.contains("B")){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Query<Entity> query = null;
        if(role.contains("B")){
            String distrito = user.getString("user_distrito");
            String concelho = user.getString("user_distrito");
            StructuredQuery.CompositeFilter f;

            if(role.equals("B2")){
                String freguesia = user.getString("user_freguesia");
                f = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("report_concelho", concelho),
                        StructuredQuery.PropertyFilter.eq("report_distrito", distrito),
                        StructuredQuery.PropertyFilter.eq("report_freguesia", freguesia));
            }
            else{
                f = StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("report_concelho", concelho),
                        StructuredQuery.PropertyFilter.eq("report_distrito", distrito));
            }


            query = Query.newEntityQueryBuilder()
                    .setKind("Report")
                    .setFilter(f)
                    .setOrderBy(StructuredQuery.OrderBy.desc("report_priority"))
                    .setLimit(100)
                    .build();

        }
        else if(role.contains("A")){
            query = Query.newEntityQueryBuilder()
                    .setKind("Report")
                    .setOrderBy(StructuredQuery.OrderBy.desc("report_priority"))
                    .setLimit(100)
                    .build();
        }


        QueryResults<Entity> reportListQuery = datastore.run(query);

        List<ReportMiniature> reportList = new ArrayList<>();

        reportListQuery.forEachRemaining(r->{
            reportList.add(new ReportMiniature(r.getKey().getName(),
                    r.getString("report_parcel_name"),
                    r.getString("report_sender"),
                    r.getString("report_distrito"),
                    r.getString("report_concelho"),
                    r.getString("report_freguesia"),
                    r.getString("report_topic"),
                    r.getString("report_message"),
                    r.getLong("report_priority")));
        });
        return Response.ok(g.toJson(reportList)).build();
    }
    //change usage
    
}



