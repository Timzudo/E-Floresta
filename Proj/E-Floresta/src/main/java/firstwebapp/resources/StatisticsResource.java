package firstwebapp.resources;

import com.google.appengine.api.memcache.stdimpl.GCacheFactory;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import firstwebapp.util.JWToken;
import firstwebapp.util.TokenData;
import firstwebapp.util.rankings.NamedCount;
import firstwebapp.util.rankings.EntityWithParcelArea;
import firstwebapp.util.rankings.EntityWithParcelCount;
import firstwebapp.util.rankings.EntityWithUserTrust;

import javax.cache.Cache;
import javax.cache.CacheException;
import javax.cache.CacheFactory;
import javax.cache.CacheManager;
import javax.inject.Singleton;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

@Path("/statistics")
public class StatisticsResource {

    private static final Logger LOG = Logger.getLogger(ParcelResource.class.getName());

    private static final String SYSADMIN_ROLE = "A1";
    private static final String MODERATOR_ROLE = "A2";
    private static final String COUNTY_TECHNICIAN_ROLE = "B1";
    private static final String PARISH_TECHNICIAN_ROLE = "B2";
    private static final String ENTITY_ROLE = "C";
    private static final String USER_ROLE = "D";

    private static final String PARCEL_ACCEPTED_STATE = "APPROVED";

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();

    private Cache cache;

    private final Gson g = new Gson();


    public StatisticsResource() {
        try {
            CacheFactory cacheFactory = CacheManager.getInstance().getCacheFactory();
            Map<Object, Object> properties = new HashMap<>();
            properties.put(GCacheFactory.EXPIRATION_DELTA, TimeUnit.HOURS.toSeconds(1));
            this.cache = cacheFactory.createCache(properties);

        } catch (CacheException e) {
            LOG.fine("Failed to get Instance of memcache.");
        }
    }

    /**************************************************************
     USER STATISTICS
     */

    @POST
    @Path("/user/parcel/totalArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsUserParcelTotalArea(TokenData tokenData) {
        LOG.fine("Getting user total parcel area");
        //TODO
        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        final Long[] totalArea = {(Long) cache.get("user_by_total_parcel_area"+tokenInfo.sub)};

        /*if (totalArea[0] != null)
            return Response.ok(totalArea[0]).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .setOrderBy(StructuredQuery.OrderBy.desc("parcel_area"))
                        .build()
        );

        totalArea[0] = 0L;

        results.forEachRemaining(p -> {
            long area = p.getLong("parcel_area");
            totalArea[0] += area;
        });

        cache.put("user_by_total_parcel_area"+tokenInfo.sub, totalArea[0]);

        return Response.ok(totalArea[0]).build();
    }

    @POST
    @Path("/user/parcel/totalPerimeter")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsUserParcelTotalPerimeter(TokenData tokenData) {
        LOG.fine("Getting user total parcel perimeter");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        final Long[] totalPerimeter = {(Long) cache.get("user_by_total_parcel_perimeter"+tokenInfo.sub)};

        /*if (totalPerimeter[0] != null)
            return Response.ok(totalPerimeter[0]).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .setOrderBy(StructuredQuery.OrderBy.desc("parcel_perimeter"))
                        .build()
        );

        totalPerimeter[0] = 0L;

        results.forEachRemaining(p -> {
            long perimeter = p.getLong("parcel_perimeter");
            totalPerimeter[0] += perimeter;
        });

        cache.put("user_by_total_parcel_perimeter"+tokenInfo.sub, totalPerimeter[0]);

        return Response.ok(totalPerimeter[0]).build();
    }

    @POST
    @Path("/user/parcel/byUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsParcelCountByUsage(TokenData tokenData) {
        LOG.fine("Getting user parcel count by usage");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Map<String, Long> parcelCountByUsage = (Map<String, Long>) cache.get("user_parcel_count_by_usage"+tokenInfo.sub);

        /*if (parcelCountByUsage != null)
            return Response.ok(g.toJson(parcelCountByUsage)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .build()
        );

        parcelCountByUsage = new HashMap<>();

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final Map<String, Long> finalParcelCountByUsage = parcelCountByUsage;

        results.forEachRemaining(
                p -> finalParcelCountByUsage.compute(
                        p.getString("parcel_usage"),
                        (k, v) -> v == null ? 1 : v+1
                )
        );

        cache.put("user_parcel_count_by_usage"+tokenInfo.sub, parcelCountByUsage);

        return Response.ok(g.toJson(parcelCountByUsage)).build();
    }


    @POST
    @Path("/user/parcel/count")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsParcelCount(TokenData tokenData) {
        LOG.fine("Getting user parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        AtomicReference<Long> count = new AtomicReference<>((Long) cache.get("user_parcel_count"+tokenInfo.sub));

        /*if (count.get() != null)
            return Response.ok(g.toJson(count.get())).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .build()
        );

        count.set(0L);

        results.forEachRemaining(p -> count.updateAndGet(v -> v+1));

        cache.put("user_parcel_count"+tokenInfo.sub, count.get());

        return Response.ok(g.toJson(count.get())).build();
    }


    @POST
    @Path("/user/parcel/totalAreaByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsParcelTotalAreaByUsage(TokenData tokenData) {
        LOG.fine("Getting user parcel total area by usage");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Map<String, Long> totalAreaByUsage = (Map<String, Long>) cache.get("parcel_total_area_by_usage"+tokenInfo.sub);

        /*if (totalAreaByUsage != null)
            return Response.ok(g.toJson(totalAreaByUsage)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .build()
        );

        totalAreaByUsage = new HashMap<>();

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final Map<String, Long> finalTotalAreaByUsage = totalAreaByUsage;

        results.forEachRemaining(
                p -> finalTotalAreaByUsage.compute(
                        p.getString("parcel_usage"),
                        (k, v) -> v == null ? p.getLong("parcel_area") : v + p.getLong("parcel_area")
                )
        );

        return Response.ok(g.toJson(totalAreaByUsage)).build();
    }


    @POST
    @Path("/user/parcel/averageArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsUserAvgParcelArea(TokenData tokenData) {
        LOG.fine("Getting user average parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Long avgParcelArea = (Long) cache.get("user_by_average_parcel_area"+tokenInfo.sub);

        /*if (avgParcelArea != null)
            return Response.ok(avgParcelArea).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub))
                        .build()
        );

        // First element is totalArea, second is parcelCount
        final long[] totalAreaAndParcelCount = {0, 0};

        results.forEachRemaining(p -> {
            totalAreaAndParcelCount[0] += p.getLong("parcel_area");
            totalAreaAndParcelCount[1] += 1;
        });

        long average = totalAreaAndParcelCount[0] / totalAreaAndParcelCount[1];

        cache.put("user_by_average_parcel_area"+tokenInfo.sub, average);

        return Response.ok(average).build();
    }


    /**************************************************************
     ENTITY STATISTICS
     */

    @POST
    @Path("/entity/parcel/totalArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelTotalArea(TokenData tokenData) {
        LOG.fine("Getting entity total parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(ENTITY_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        final Long[] totalArea = {(Long) cache.get("entity_by_total_parcel_area"+tokenInfo.sub)};

        /*if (totalArea[0] != null)
            return Response.ok(totalArea[0]).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .setOrderBy(StructuredQuery.OrderBy.desc("parcel_area"))
                        .build()
        );

        totalArea[0] = 0L;

        results.forEachRemaining(p -> {
            long area = p.getLong("parcel_area");
            totalArea[0] += area;
        });

        cache.put("entity_by_total_parcel_area"+tokenInfo.sub, totalArea[0]);

        return Response.ok(totalArea[0]).build();
    }

    @POST
    @Path("/entity/parcel/totalPerimeter")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelTotalPerimeter(TokenData tokenData) {
        LOG.fine("Getting entity total parcel perimeter");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(ENTITY_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        final Long[] totalPerimeter = {(Long) cache.get("entity_by_total_parcel_perimeter"+tokenInfo.sub)};

        /*if (totalPerimeter[0] != null)
            return Response.ok(totalPerimeter[0]).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .setOrderBy(StructuredQuery.OrderBy.desc("parcel_perimeter"))
                        .build()
        );

        totalPerimeter[0] = 0L;

        results.forEachRemaining(p -> {
            long perimeter = p.getLong("parcel_perimeter");
            totalPerimeter[0] += perimeter;
        });

        return Response.ok(totalPerimeter[0]).build();
    }

    @POST
    @Path("/entity/parcel/byUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelCountByUsage(TokenData tokenData) {
        LOG.fine("Getting entity parcel count by usage");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(ENTITY_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Map<String, Long> parcelCountByUsage = (Map<String, Long>) cache.get("entity_parcel_count_by_usage"+tokenInfo.sub);

        /*if (parcelCountByUsage != null)
            return Response.ok(g.toJson(parcelCountByUsage)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .build()
        );

        parcelCountByUsage = new HashMap<>();

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final Map<String, Long> finalParcelCountByUsage = parcelCountByUsage;

        results.forEachRemaining(
                p -> finalParcelCountByUsage.compute(
                        p.getString("parcel_usage"),
                        (k, v) -> v == null ? 1 : v+1
                )
        );

        cache.put("entity_parcel_count_by_usage"+tokenInfo.sub, parcelCountByUsage);

        return Response.ok(g.toJson(parcelCountByUsage)).build();
    }


    @POST
    @Path("/entity/parcel/totalAreaByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelTotalAreaByUsage(TokenData tokenData) {
        LOG.fine("Getting entity parcel total area by usage");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(ENTITY_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Map<String, Long> totalAreaByUsage = (Map<String, Long>) cache.get("entity_parcel_total_area_by_usage"+tokenInfo.sub);

        /*if (totalAreaByUsage != null)
            return Response.ok(g.toJson(totalAreaByUsage)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .build()
        );

        totalAreaByUsage = new HashMap<>();

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final Map<String, Long> finalTotalAreaByUsage = totalAreaByUsage;

        results.forEachRemaining(
                p -> finalTotalAreaByUsage.compute(
                        p.getString("parcel_usage"),
                        (k, v) -> v == null ? p.getLong("parcel_area") : v + p.getLong("parcel_area")
                )
        );

        cache.put("entity_parcel_total_area_by_usage"+tokenInfo.sub, finalTotalAreaByUsage);

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }


    @POST
    @Path("/entity/parcel/count")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelCount(TokenData tokenData) {
        LOG.fine("Getting entity parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if(tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(USER_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        AtomicReference<Long> count = new AtomicReference<>((Long) cache.get("user_parcel_count"+tokenInfo.sub));

        /*if (count.get() != null)
            return Response.ok(g.toJson(count.get())).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .build()
        );

        count.set(0L);

        results.forEachRemaining(p -> count.updateAndGet(v -> v+1));

        cache.put("entity_parcel_count"+tokenInfo.sub, count.get());

        return Response.ok(g.toJson(count.get())).build();
    }


    @POST
    @Path("/entity/parcel/averageArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityAvgParcelArea(TokenData tokenData) {
        LOG.fine("Getting entity average parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        if (!tokenInfo.role.equals(ENTITY_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Long avgParcelArea = (Long) cache.get("entity_by_average_parcel_area"+tokenInfo.sub);

        /*if (avgParcelArea != null)
            return Response.ok(avgParcelArea).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub))
                        .build()
        );

        // First element is totalArea, second is parcelCount
        final long[] totalAreaAndParcelCount = {0, 0};

        results.forEachRemaining(p -> {
            totalAreaAndParcelCount[0] += p.getLong("parcel_area");
            totalAreaAndParcelCount[1] += 1;
        });

        long average = totalAreaAndParcelCount[0] / totalAreaAndParcelCount[1];

        cache.put("entity_by_average_parcel_area"+tokenInfo.sub, average);

        return Response.ok(average).build();
    }

    @POST
    @Path("/rankings/byUserUserTrust")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserUserTrust(TokenData tokenData) {
        LOG.fine("Getting ranking by user usertrust");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithUserTrust> userByUserTrust = (List<EntityWithUserTrust>) cache.get("user_by_usertrust");

        /*if (userByUserTrust != null)
            return Response.ok(g.toJson(userByUserTrust)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", USER_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_trust"))
                        .setLimit(10)
                        .build()
        );

        userByUserTrust = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final List<EntityWithUserTrust> finalUserByUserTrust = userByUserTrust;

        results.forEachRemaining(p -> {
            String userName = p.getKey().getName();
            Long userTrust = p.getLong("user_trust");
            finalUserByUserTrust.add(new EntityWithUserTrust(userName, userTrust));
        });

        cache.put("user_by_usertrust", userByUserTrust);

        return Response.ok(g.toJson(userByUserTrust)).build();
    }


    @POST
    @Path("/rankings/byUserParcelArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserParcelArea(TokenData tokenData) {
        LOG.fine("Getting ranking by user parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithParcelArea> userWithParcelAreaList = (List<EntityWithParcelArea>) cache.get("user_by_parcel_area");

        /*if (userWithParcelAreaList != null)
            return Response.ok(g.toJson(userWithParcelAreaList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", USER_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_total_parcel_area"))
                        .setLimit(10)
                        .build()
        );

        userWithParcelAreaList = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final List<EntityWithParcelArea> finalUserWithParcelAreaList = userWithParcelAreaList;

        results.forEachRemaining(u -> {
            String userName = u.getKey().getName();
            Long totalParcelArea = u.getLong("user_total_parcel_area");

            finalUserWithParcelAreaList.add(new EntityWithParcelArea(userName, totalParcelArea));
        });

        cache.put("user_by_parcel_area", userWithParcelAreaList);

        return Response.ok(g.toJson(userWithParcelAreaList)).build();
    }

    @POST
    @Path("/rankings/byUserParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserParcelCount(TokenData tokenData) {
        LOG.fine("Getting ranking by user parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithParcelCount> userParcelCountList = (List<EntityWithParcelCount>) cache.get("user_by_parcel_count");

        /*if (userParcelCountList != null)
            return Response.ok(g.toJson(userParcelCountList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", USER_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_parcel_count"))
                        .setLimit(10)
                        .build()
        );

        userParcelCountList = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        final List<EntityWithParcelCount> finalUserParcelCountList = userParcelCountList;

        results.forEachRemaining(u -> {
            String userName = u.getKey().getName();
            Long parcelCount = u.getLong("user_parcel_count");

            finalUserParcelCountList.add(new EntityWithParcelCount(userName, parcelCount));
        });

        cache.put("user_by_parcel_count", userParcelCountList);

        return Response.ok(g.toJson(userParcelCountList)).build();
    }

    @POST
    @Path("/rankings/byEntityUserTrust")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByEntityUserTrust(TokenData tokenData) {
        LOG.fine("Getting ranking by entity usertrust");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithUserTrust> entityWithUserTrustList = (List<EntityWithUserTrust>) cache.get("entity_by_usertrust");

        /*if (entityWithUserTrustList != null)
            return Response.ok(g.toJson(entityWithUserTrustList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", ENTITY_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_trust"))
                        .setLimit(10)
                        .build()
        );

        entityWithUserTrustList = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        List<EntityWithUserTrust> finalEntityWithUserTrustList = entityWithUserTrustList;

        results.forEachRemaining(p -> {
            String userName = p.getKey().getName();
            Long userTrust = p.getLong("user_trust");
            finalEntityWithUserTrustList.add(new EntityWithUserTrust(userName, userTrust));
        });

        cache.put("entity_by_usertrust", entityWithUserTrustList);

        return Response.ok(g.toJson(entityWithUserTrustList)).build();
    }

    @POST
    @Path("/rankings/byEntityParcelArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByEntityParcelArea(TokenData tokenData) {
        LOG.fine("Getting ranking by entity parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithParcelArea> entityWithParcelAreaList = (List<EntityWithParcelArea>) cache.get("entity_by_parcel_area");

        /*if (entityWithParcelAreaList != null)
            return Response.ok(g.toJson(entityWithParcelAreaList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", ENTITY_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_total_parcel_area"))
                        .setLimit(10)
                        .build()
        );

        entityWithParcelAreaList = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        List<EntityWithParcelArea> finalEntityWithParcelAreaList = entityWithParcelAreaList;

        results.forEachRemaining(u -> {
            String userName = u.getKey().getName();
            Long totalParcelArea = u.getLong("user_total_parcel_area");

            finalEntityWithParcelAreaList.add(new EntityWithParcelArea(userName, totalParcelArea));
        });

        cache.put("entity_by_parcel_area", entityWithParcelAreaList);

        return Response.ok(g.toJson(entityWithParcelAreaList)).build();
    }

    @POST
    @Path("/rankings/byEntityParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByEntityParcelCount(TokenData tokenData) {
        LOG.fine("Getting ranking by entity parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        // TODO: Role?

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        List<EntityWithParcelCount> entityWithParcelCountList = (List<EntityWithParcelCount>) cache.get("entity_by_parcel_count");

        /*if (entityWithParcelCountList != null)
            return Response.ok(g.toJson(entityWithParcelCountList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("User")
                        .setFilter(StructuredQuery.PropertyFilter.eq("user_role", ENTITY_ROLE))
                        .setOrderBy(StructuredQuery.OrderBy.desc("user_parcel_count"))
                        .setLimit(10)
                        .build()
        );

        entityWithParcelCountList = new ArrayList<>(10);

        // Required variable so the code below doesn't throw an error since lambda functions must access final variables
        List<EntityWithParcelCount> finalEntityWithParcelCountList = entityWithParcelCountList;

        results.forEachRemaining(u -> {
            String userName = u.getKey().getName();
            Long parcelCount = u.getLong("user_parcel_count");

            finalEntityWithParcelCountList.add(new EntityWithParcelCount(userName, parcelCount));
        });

        cache.put("entity_by_parcel_count", entityWithParcelCountList);

        return Response.ok(g.toJson(entityWithParcelCountList)).build();
    }


    @POST
    @Path("/areaTotal")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response areaTotal(TokenData tokenData) {
        LOG.fine("Getting area usage in distrito: ");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> areaUsage = new AtomicReference<>((Long) cache.get("area_usage_in_"));

        /*if (areaUsage.get() != null)
            return Response.ok(areaUsage.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        areaUsage.set(0L);

        results.forEachRemaining(p -> areaUsage.updateAndGet(v -> v + p.getLong("parcel_area")));

        cache.put("area_usage_in_", areaUsage.get());

        return Response.ok(areaUsage.get()).build();
    }


    @POST
    @Path("/areaTotal/{distrito}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response areaUsageInDistrito(@PathParam("distrito") String distrito, TokenData tokenData) {
        LOG.fine("Getting area usage in distrito: "+distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> areaUsage = new AtomicReference<>((Long) cache.get("area_usage_in_"+distrito));

        /*if (areaUsage.get() != null)
            return Response.ok(areaUsage).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito))
                        .build()
        );

        areaUsage.set(0L);

        results.forEachRemaining(p -> {
            areaUsage.updateAndGet(v -> v + p.getLong("parcel_area"));
        });

        cache.put("area_usage_in_"+distrito, areaUsage.get());

        return Response.ok(areaUsage.get()).build();
    }

    @POST
    @Path("/areaTotal/{distrito}/{concelho}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response areaUsageInDistritoConcelho(@PathParam("distrito") String distrito, @PathParam("concelho") String concelho, TokenData tokenData) {
        LOG.fine("Getting area usage in concelho: " + concelho + " - " + distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> areaUsage = new AtomicReference<>((Long) cache.get("area_usage_in_"+distrito+"_"+concelho));

        /*if (areaUsage.get() != null)
            return Response.ok(areaUsage).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho))
                        .build()
        );

        areaUsage.set(0L);


        results.forEachRemaining(p -> {
            areaUsage.updateAndGet(v -> v + p.getLong("parcel_area"));
        });

        cache.put("area_usage_in_"+distrito+"_"+concelho, areaUsage.get());

        return Response.ok(areaUsage.get()).build();
    }

    @POST
    @Path("/areaTotal/{distrito}/{concelho}/{freguesia}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response areaUsageInDistritoConcelhoFreguesia(
            @PathParam("distrito") String distrito,
            @PathParam("concelho") String concelho,
            @PathParam("freguesia") String freguesia,
            TokenData tokenData
    ) {
        LOG.fine("Getting area usage in concelho: " + freguesia + " - " + concelho + " - " + distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> areaUsage = new AtomicReference<>((Long) cache.get("area_usage_in_"+distrito+"_"+concelho+"_"+freguesia));

        /*if (areaUsage.get() != null)
            return Response.ok(areaUsage).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia))
                        .build()
        );

        areaUsage.set(0L);

        results.forEachRemaining(p -> {
            areaUsage.updateAndGet(v -> v + p.getLong("parcel_area"));
        });

        cache.put("area_usage_in_"+distrito+"_"+concelho+"_"+freguesia, areaUsage.get());

        return Response.ok(areaUsage.get()).build();
    }

    @POST
    @Path("/rankings/distritosByParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response distritosByParcelCount(TokenData tokenData) {
        LOG.fine("Getting distritos by parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!(tokenInfo.role.equals(SYSADMIN_ROLE) || tokenInfo.role.equals(MODERATOR_ROLE)))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<ArrayList<NamedCount>> distritoWithParcelCountsList =
                new AtomicReference<>((ArrayList<NamedCount>) cache.get("distrito_by_parcel_count"));

        /*if (distritoWithParcelCountsList.get() != null)
            return Response.ok(g.toJson(distritoWithParcelCountsList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        distritoWithParcelCountsList.updateAndGet(v -> new ArrayList<>());

        Map<String, Long> distritoToParcelCount = new HashMap<>();

        results.forEachRemaining(p -> {
            distritoToParcelCount.compute(p.getString("parcel_distrito"), (k, v) -> v == null ? 1 : v+1);
        });

        for (Map.Entry<String, Long> entry : distritoToParcelCount.entrySet()) {
            distritoWithParcelCountsList.updateAndGet(v -> {
                v.add(new NamedCount(entry.getKey(), entry.getValue()));
                return v;
            });
        }

        distritoWithParcelCountsList.updateAndGet(v -> {
            v.sort((o1, o2) -> -o1.getCount().compareTo(o2.getCount()));
            return new ArrayList<>(v.subList(0, Math.min(10, v.size())));
        });

        cache.put("distrito_by_parcel_count", distritoWithParcelCountsList.get());

        return Response.ok(g.toJson(distritoWithParcelCountsList.get())).build();
    }

    @POST
    @Path("/rankings/concelhosByParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response concelhosByParcelCount(TokenData tokenData) {
        LOG.fine("Getting concelhos by parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<ArrayList<NamedCount>> distritoWithParcelCountsList =
                new AtomicReference<>((ArrayList<NamedCount>) cache.get("concelho_by_parcel_count"));

        /*if (distritoWithParcelCountsList.get() != null)
            return Response.ok(g.toJson(distritoWithParcelCountsList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        distritoWithParcelCountsList.updateAndGet(v -> new ArrayList<>());

        Map<String, Long> distritoToParcelCount = new HashMap<>();

        results.forEachRemaining(p -> {
            distritoToParcelCount.compute(p.getString("parcel_concelho"), (k, v) -> v == null ? 1 : v+1);
        });

        for (Map.Entry<String, Long> entry : distritoToParcelCount.entrySet()) {
            distritoWithParcelCountsList.updateAndGet(v -> {
                v.add(new NamedCount(entry.getKey(), entry.getValue()));
                return v;
            });
        }

        distritoWithParcelCountsList.updateAndGet(v -> {
            v.sort((o1, o2) -> -o1.getCount().compareTo(o2.getCount()));
            return new ArrayList<>(v.subList(0, Math.min(20, v.size())));
        });

        cache.put("concelho_by_parcel_count", distritoWithParcelCountsList.get());

        return Response.ok(g.toJson(distritoWithParcelCountsList.get())).build();
    }

    @POST
    @Path("/rankings/freguesiasByParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response freguesiasByParcelCount(TokenData tokenData) {
        LOG.fine("Getting freguesias by parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<ArrayList<NamedCount>> distritoWithParcelCountsList =
                new AtomicReference<>((ArrayList<NamedCount>) cache.get("freguesia_by_parcel_count"));

        /*if (distritoWithParcelCountsList.get() != null)
            return Response.ok(g.toJson(distritoWithParcelCountsList)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        distritoWithParcelCountsList.updateAndGet(v -> new ArrayList<>());

        Map<String, Long> distritoToParcelCount = new HashMap<>();

        results.forEachRemaining(p -> {
            distritoToParcelCount.compute(p.getString("parcel_freguesia"), (k, v) -> v == null ? 1 : v+1);
        });

        for (Map.Entry<String, Long> entry : distritoToParcelCount.entrySet()) {
            distritoWithParcelCountsList.updateAndGet(v -> {
                v.add(new NamedCount(entry.getKey(), entry.getValue()));
                return v;
            });
        }

        distritoWithParcelCountsList.updateAndGet(v -> {
            v.sort((o1, o2) -> -o1.getCount().compareTo(o2.getCount()));
            return new ArrayList<>(v.subList(0, Math.min(30, v.size())));
        });

        cache.put("freguesia_by_parcel_count", distritoWithParcelCountsList.get());

        return Response.ok(g.toJson(distritoWithParcelCountsList.get())).build();
    }

    @POST
    @Path("/areaUsage/{distrito}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response distritoParcelAreaByUsage(@PathParam("distrito") String distrito, TokenData tokenData) {
        LOG.fine("Getting parcel area by usage for distrito: "+distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Map<String, Long> totalAreaByUsage = (Map<String, Long>) cache.get("parcel_area_by_usage_"+tokenInfo.sub);

        /*if (list.get() != null)
            return Response.ok(g.toJson(list)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito)))
                        .build()
        );

        totalAreaByUsage = new HashMap<>();

        final Map<String, Long> finalTotalAreaByUsage = totalAreaByUsage;


        results.forEachRemaining(p -> finalTotalAreaByUsage.compute(
                p.getString("parcel_usage"),
                (k, v) -> v == null ? p.getLong("parcel_area") : v + p.getLong("parcel_area")
        ));


        cache.put("parcel_area_by_usage_"+distrito, finalTotalAreaByUsage);

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }


    @POST
    @Path("/areaUsage/{distrito}/{concelho}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response distritoConcelhoParcelAreaByUsage(
            @PathParam("distrito") String distrito,
            @PathParam("concelho") String concelho,
            TokenData tokenData) {
        LOG.fine("Getting parcel area by usage for concelho: "+concelho+" - "+distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Map<String, Long> totalAreaByUsage = (Map<String, Long>) cache.get("parcel_area_by_usage_"+tokenInfo.sub);

        /*if (list.get() != null)
            return Response.ok(g.toJson(list)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho)))
                        .build()
        );

        totalAreaByUsage = new HashMap<>();

        final Map<String, Long> finalTotalAreaByUsage = totalAreaByUsage;


        results.forEachRemaining(p -> finalTotalAreaByUsage.compute(
                p.getString("parcel_usage"),
                (k, v) -> v == null ? p.getLong("parcel_area") : v + p.getLong("parcel_area")
        ));


        cache.put("parcel_area_by_usage_"+concelho, finalTotalAreaByUsage);

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }

    @POST
    @Path("/areaUsage/{distrito}/{concelho}/{freguesia}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response distritoConcelhoFreguesiaParcelAreaByUsage(
            @PathParam("distrito") String distrito,
            @PathParam("concelho") String concelho,
            @PathParam("freguesia") String freguesia,
            TokenData tokenData) {
        LOG.fine("Getting parcel area by usage for concelho: "+freguesia+"_"+concelho+" - "+distrito);

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        Map<String, Long> totalAreaByUsage = (Map<String, Long>) cache.get("parcel_area_by_usage_"+tokenInfo.sub);

        /*if (list.get() != null)
            return Response.ok(g.toJson(list)).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia)))
                        .build()
        );

        totalAreaByUsage = new HashMap<>();

        final Map<String, Long> finalTotalAreaByUsage = totalAreaByUsage;


        results.forEachRemaining(p -> finalTotalAreaByUsage.compute(
                p.getString("parcel_usage"),
                (k, v) -> v == null ? p.getLong("parcel_area") : v + p.getLong("parcel_area")
        ));


        cache.put("parcel_area_by_usage_"+freguesia, finalTotalAreaByUsage);

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }

    @POST
    @Path("/rankings/parcelAvgArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelAvgArea(TokenData tokenData) {
        LOG.fine("Getting avg parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> avgArea = new AtomicReference<>((Long) cache.get("avg_total_parcel_area"));

        /*if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        AtomicReference<Long> totalParcelArea = new AtomicReference<>(0L);
        AtomicReference<Long> parcelCount = new AtomicReference<>(0L);

        results.forEachRemaining(p -> {
            totalParcelArea.updateAndGet(v -> v + p.getLong("parcel_area"));
            parcelCount.set(parcelCount.get() + 1);
        });

        avgArea.set(totalParcelArea.get() / parcelCount.get());

        cache.put("avg_total_parcel_area", avgArea.get());

        return Response.ok(avgArea.get()).build();
    }

    @POST
    @Path("/rankings/parcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelTotalCountAdmin(TokenData tokenData) {
        LOG.fine("Getting avg parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(SYSADMIN_ROLE) && !tokenInfo.role.equals(MODERATOR_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        AtomicReference<Long> parcelCount = new AtomicReference<>((Long) cache.get("parcel_count_admin"));

        /*if (parcelCount.get() != null)
            return Response.ok(parcelCount.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        parcelCount.set(0L);

        results.forEachRemaining(p -> parcelCount.updateAndGet(v -> v + 1));


        cache.put("parcel_count_admin", parcelCount.get());

        return Response.ok(parcelCount.get()).build();
    }


    /***********************************+
     * Tecnico B1
     */
    @POST
    @Path("/rankings/parcelAvgAreaInConcelho")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelAvgAreaInConcelho(TokenData tokenData) {
        LOG.fine("Getting avg parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(COUNTY_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> avgArea = new AtomicReference<>((Long) cache.get("average_parcel_area_in_concelho_"+freguesia+"_"+concelho+"_"+distrito));

        /*if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                        .build()
        );

        AtomicReference<Long> totalParcelArea = new AtomicReference<>(0L);
        AtomicReference<Long> parcelCount = new AtomicReference<>(0L);

        results.forEachRemaining(p -> {
            totalParcelArea.updateAndGet(v -> v + p.getLong("parcel_area"));
            parcelCount.set(parcelCount.get() + 1);
        });

        try {
            avgArea.set(totalParcelArea.get() / parcelCount.get());
        } catch (ArithmeticException e) {
            avgArea.set(0L);
        }

        cache.put("average_parcel_area_in_concelho_"+freguesia+"_"+concelho+"_"+distrito, avgArea.get());

        return Response.ok(avgArea.get()).build();
    }

    @POST
    @Path("/rankings/totalParcelAreaInConcelho")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response totalParcelAreaInConcelho(TokenData tokenData) {
        LOG.fine("Getting total parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(COUNTY_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> totalArea = new AtomicReference<>((Long) cache.get("total_parcel_area_in_concelho_"+freguesia+"_"+concelho+"_"+distrito));

        /*if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                        .build()
        );

        totalArea.set(0L);

        results.forEachRemaining(p -> {
            totalArea.updateAndGet(v -> v + p.getLong("parcel_area"));
        });


        cache.put("total_parcel_area_in_concelho_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(totalArea.get()).build();
    }


    @POST
    @Path("/rankings/parcelCountInConcelho")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelCountInConfcelho(TokenData tokenData) {
        LOG.fine("Getting total parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(COUNTY_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> totalArea = new AtomicReference<>();

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                        .build()
        );

        totalArea.set(0L);

        results.forEachRemaining(p -> totalArea.updateAndGet(v -> v + 1));


        cache.put("parcel_count_in_concelho_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(totalArea.get()).build();
    }

    @POST
    @Path("/rankings/parcelAreaInConcelhoByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelTotalAreaInConcelhoByUsage(TokenData tokenData) {
        LOG.fine("Getting parcel area by usage in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(COUNTY_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();


        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<HashMap<String, Long>> list = new AtomicReference<>();

        if (list.get() != null)
            return Response.ok(g.toJson(list)).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                        .build()
        );

        list.set(new HashMap<>());

        results.forEachRemaining(p -> {
            list.get().compute(p.getString("parcel_usage"), (k, v) -> v == null ? p.getLong("parcel_area") : v+p.getLong("parcel_area"));
        });

        cache.put("parcel_area_in_concelho_by_usage_"+freguesia+"_"+concelho+"_"+distrito, list.get());

        return Response.ok(g.toJson(list.get())).build();
    }

    @POST
    @Path("/rankings/parcelCountInConcelhoByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelCountInConcelhoByUsage(TokenData tokenData) {
        LOG.fine("Getting total parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(COUNTY_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<HashMap<String, Long>> totalArea = new AtomicReference<>();

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", user.getString("user_concelho"))))
                        .build()
        );

        totalArea.set(new HashMap<>());

        results.forEachRemaining(
                p -> totalArea.updateAndGet(
                        v -> {
                            v.compute(
                                    p.getString("parcel_usage"),
                                    (k, val) -> val == null ? 1 : val + 1
                            );
                            return v;
                        }));


        cache.put("parcel_count_in_concelho_" + freguesia + "_" + concelho + "_" + distrito, totalArea.get());

        return Response.ok(g.toJson(totalArea.get())).build();
    }


    /***********************************+
     * Tecnico B2
     */
    @POST
    @Path("/rankings/parcelAvgAreaInFreguesia")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelAvgAreaInFreguesia(TokenData tokenData) {
        LOG.fine("Getting avg parcel area in freguesia");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(PARISH_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> avgArea = new AtomicReference<>((Long) cache.get("parcel_avg_area_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito));

        /*if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"))))
                        .build()
        );

        AtomicReference<Long> totalParcelArea = new AtomicReference<>(0L);
        AtomicReference<Long> parcelCount = new AtomicReference<>(0L);

        results.forEachRemaining(p -> {
            totalParcelArea.updateAndGet(v -> v + p.getLong("parcel_area"));
            parcelCount.set(parcelCount.get() + 1);
        });

        try {
            avgArea.set(totalParcelArea.get() / parcelCount.get());
        } catch (ArithmeticException e) {
            avgArea.set(0L);
        }


        cache.put("parcel_avg_area_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito, avgArea.get());

        return Response.ok(avgArea.get()).build();
    }

    @POST
    @Path("/rankings/totalParcelAreaInFreguesia")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response totalParcelAreaInFreguesia(TokenData tokenData) {
        LOG.fine("Getting total parcel area in freguesia");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(PARISH_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> totalArea = new AtomicReference<>((Long) cache.get("total_parcel_area_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito));

        /*if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();*/

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                        StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"))))
                        .build()
        );

        totalArea.set(0L);

        results.forEachRemaining(p -> {
            totalArea.updateAndGet(v -> v + p.getLong("parcel_area"));
        });


        cache.put("total_parcel_area_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(totalArea.get()).build();
    }

    @POST
    @Path("/rankings/parcelAreaInFreguesiaByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelTotalAreaInFreguesiaByUsage(TokenData tokenData) {
        LOG.fine("Getting parcel area by usage in freguesia");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(PARISH_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<HashMap<String, Long>> list =
                new AtomicReference<>();

        if (list.get() != null)
            return Response.ok(g.toJson(list)).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"))))
                        .build()
        );

        list.set(new HashMap<>());

        results.forEachRemaining(p -> {
            list.get().compute(p.getString("parcel_usage"), (k, v) -> v == null ? 1 : v+p.getLong("parcel_area"));
        });

        cache.put("parcel_area_in_freguesia_by_usage_"+freguesia+"_"+concelho+"_"+distrito, list.get());

        return Response.ok(g.toJson(list.get())).build();
    }


    @POST
    @Path("/rankings/parcelCountInFreguesiaByUsage")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelCountInFreguesiaByUsage(TokenData tokenData) {
        LOG.fine("Getting total parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(PARISH_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<HashMap<String, Long>> totalArea = new AtomicReference<>();

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia"))))
                        .build()
        );

        totalArea.set(new HashMap<>());

        results.forEachRemaining(
                p -> totalArea.updateAndGet(
                        v ->  {
                            v.compute(
                                    p.getString("parcel_usage"),
                                    (k, val) -> val == null ? 1 : val+1
                            );
                            return v;
                        }));


        cache.put("parcel_count_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(g.toJson(totalArea.get())).build();
    }


    @POST
    @Path("/rankings/parcelCountInFreguesia")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response parcelCountInFreguesia(TokenData tokenData) {
        LOG.fine("Getting total parcel area in concelho");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        if (!tokenInfo.role.equals(PARISH_TECHNICIAN_ROLE))
            return Response.status(Response.Status.FORBIDDEN).build();

        String distrito = user.getString("user_distrito");
        String concelho = user.getString("user_concelho");
        String freguesia = user.getString("user_freguesia");

        AtomicReference<Long> totalArea = new AtomicReference<>();

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia")))
                        .build()
        );

        totalArea.set(0L);

        results.forEachRemaining(p -> totalArea.updateAndGet(v -> v+1));


        cache.put("parcel_count_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(totalArea.get()).build();
    }

}