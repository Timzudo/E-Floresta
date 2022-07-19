package firstwebapp.resources;

import com.google.appengine.api.memcache.stdimpl.GCacheFactory;
import com.google.cloud.datastore.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
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
            properties.put(GCacheFactory.EXPIRATION_DELTA, TimeUnit.MINUTES.toSeconds(5));
            this.cache = cacheFactory.createCache(properties);

        } catch (CacheException e) {
            LOG.fine("Failed to get Instance of memcache.");
        }
    }

    /**************************************************************
     USER STATISTICS
     */

    //
    @POST
    @Path("/user/parcel/totalArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsUserParcelTotalArea(TokenData tokenData) {
        LOG.fine("Getting user total parcel area");
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

        if (totalArea[0] != null)
            return Response.ok(totalArea[0]).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub)))
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


    //
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

        Object o = cache.get("user_parcel_count_by_usage"+tokenInfo.sub);
        Map<String, Long> parcelCountByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub)))
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

        cache.put("user_parcel_count_by_usage"+tokenInfo.sub, g.toJson(parcelCountByUsage));

        return Response.ok(g.toJson(parcelCountByUsage)).build();
    }

    //
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

        Long count = (Long) cache.get("user_parcel_count"+tokenInfo.sub);

        if (count != null)
            return Response.ok(count).build();


        count = user.getLong("user_parcel_count");


        cache.put("user_parcel_count"+tokenInfo.sub, count);

        return Response.ok(g.toJson(count)).build();
    }

    //
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


        Object o = cache.get("parcel_total_area_by_usage"+tokenInfo.sub);
        Map<String, Long> totalAreaByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub)))
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

        cache.put("parcel_total_area_by_usage"+tokenInfo.sub, g.toJson(totalAreaByUsage));

        return Response.ok(g.toJson(totalAreaByUsage)).build();
    }

    //
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

        if (avgParcelArea != null)
            return Response.ok(avgParcelArea).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_owner", tokenInfo.sub)))
                        .build()
        );

        // First element is totalArea, second is parcelCount
        final long[] totalAreaAndParcelCount = {0, 0};

        results.forEachRemaining(p -> {
            totalAreaAndParcelCount[0] += p.getLong("parcel_area");
            totalAreaAndParcelCount[1] += 1;
        });

        long average;

        try {
            average = totalAreaAndParcelCount[0] / totalAreaAndParcelCount[1];
        } catch (ArithmeticException e) {
            average = 0;
        }


        cache.put("user_by_average_parcel_area"+tokenInfo.sub, average);

        return Response.ok(average).build();
    }


    /**************************************************************
     ENTITY STATISTICS
     */

    //
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

        Long totalArea = (Long) cache.get("entity_by_total_parcel_area"+tokenInfo.sub);

        if (totalArea != null)
            return Response.ok(totalArea).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub)))
                        .build()
        );

        totalArea = 0L;

        while(results.hasNext()){
            long area = results.next().getLong("parcel_area");
            totalArea += area;
        }

        cache.put("entity_by_total_parcel_area"+tokenInfo.sub, totalArea);

        return Response.ok(totalArea).build();
    }


    //
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

        Object o = cache.get("entity_parcel_count_by_usage"+tokenInfo.sub);
        Map<String, Long> parcelCountByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub)))
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

        cache.put("entity_parcel_count_by_usage"+tokenInfo.sub, g.toJson(parcelCountByUsage));

        return Response.ok(g.toJson(parcelCountByUsage)).build();
    }


    //
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

        Object o = cache.get("entity_parcel_total_area_by_usage"+tokenInfo.sub);
        Map<String, Long> totalAreaByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub)))
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

        cache.put("entity_parcel_total_area_by_usage"+tokenInfo.sub, g.toJson(finalTotalAreaByUsage));

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }


    //
    @POST
    @Path("/entity/parcel/count")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response statisticsEntityParcelCount(TokenData tokenData) {
        LOG.fine("Getting entity parcel count");

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

        Long count = (Long) cache.get("entity_parcel_count"+tokenInfo.sub);

        if (count != null)
            return Response.ok(count).build();


        count = user.getLong("user_parcel_count");

        cache.put("entity_parcel_count"+tokenInfo.sub, count);

        return Response.ok(count).build();
    }

    //
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

        if (avgParcelArea != null)
            return Response.ok(avgParcelArea).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_manager", tokenInfo.sub)))
                        .build()
        );

        // First element is totalArea, second is parcelCount
        final long[] totalAreaAndParcelCount = {0, 0};

        results.forEachRemaining(p -> {
            totalAreaAndParcelCount[0] += p.getLong("parcel_area");
            totalAreaAndParcelCount[1] += 1;
        });


        long average;

        try {
            average = totalAreaAndParcelCount[0] / totalAreaAndParcelCount[1];
        } catch (ArithmeticException e) {
            average = 0;
        }



        cache.put("entity_by_average_parcel_area"+tokenInfo.sub, average);

        return Response.ok(average).build();
    }

    //
    @POST
    @Path("/rankings/byUserUserTrust")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserUserTrust(TokenData tokenData) {
        LOG.fine("Getting ranking by user usertrust");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();


        Object o = cache.get("user_by_usertrust");
        List<EntityWithUserTrust> userByUserTrust;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

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

        cache.put("user_by_usertrust", g.toJson(userByUserTrust));

        return Response.ok(g.toJson(userByUserTrust)).build();
    }

    //
    @POST
    @Path("/rankings/byUserParcelArea")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserParcelArea(TokenData tokenData) {
        LOG.fine("Getting ranking by user parcel area");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Object o = cache.get("user_by_parcel_area");
        List<EntityWithParcelArea> userWithParcelAreaList;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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

        cache.put("user_by_parcel_area", g.toJson(userWithParcelAreaList));

        return Response.ok(g.toJson(userWithParcelAreaList)).build();
    }

    //
    @POST
    @Path("/rankings/byUserParcelCount")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response rankingByUserParcelCount(TokenData tokenData) {
        LOG.fine("Getting ranking by user parcel count");

        JWToken.TokenInfo tokenInfo = JWToken.verifyToken(tokenData.token);
        if (tokenInfo == null)
            return Response.status(Response.Status.FORBIDDEN).entity("Invalid token.").build();

        Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenInfo.sub);
        Entity user = datastore.get(userKey);

        if (user == null)
            return Response.status(Response.Status.NOT_FOUND).entity("User does not exist.").build();

        if (!user.getString("user_state").equals("ACTIVE"))
            return Response.status(Response.Status.FORBIDDEN).entity("User does not exist.").build();

        Object o = cache.get("user_by_parcel_count");
        List<EntityWithParcelCount> userParcelCountList;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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

        cache.put("user_by_parcel_count", g.toJson(userParcelCountList));

        return Response.ok(g.toJson(userParcelCountList)).build();
    }

    //
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

        Long areaUsage = (Long) cache.get("area_usage_in_");

        if (areaUsage != null)
            return Response.ok(areaUsage).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .build()
        );

        areaUsage = 0L;

        while(results.hasNext()){
            areaUsage += results.next().getLong("parcel_area");
        }

        cache.put("area_usage_in_", areaUsage);

        return Response.ok(areaUsage).build();
    }


    //
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

        Long areaUsage = (Long) cache.get("area_usage_in_"+distrito);

        if (areaUsage != null)
            return Response.ok(areaUsage).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito)))
                        .build()
        );

        areaUsage = 0L;


        while(results.hasNext()){
            areaUsage += results.next().getLong("parcel_area");
        }


        cache.put("area_usage_in_"+distrito, areaUsage);

        return Response.ok(areaUsage).build();
    }

    //
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

        Long areaUsage = (Long) cache.get("area_usage_in_"+distrito+"_"+concelho);

        if (areaUsage != null)
            return Response.ok(areaUsage).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho)))
                        .build()
        );

        areaUsage = 0L;

        while(results.hasNext()){
            areaUsage += results.next().getLong("parcel_area");
        }

        cache.put("area_usage_in_"+distrito+"_"+concelho, areaUsage);

        return Response.ok(areaUsage).build();
    }

    //
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

        Long areaUsage = (Long) cache.get("area_usage_in_"+distrito+"_"+concelho+"_"+freguesia);

        if (areaUsage != null)
            return Response.ok(areaUsage).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.CompositeFilter.and(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE),
                                StructuredQuery.PropertyFilter.eq("parcel_distrito", distrito),
                                StructuredQuery.PropertyFilter.eq("parcel_concelho", concelho),
                                StructuredQuery.PropertyFilter.eq("parcel_freguesia", freguesia)))
                        .build()
        );

        areaUsage = 0L;

        while(results.hasNext()){
            areaUsage += results.next().getLong("parcel_area");
        }

        cache.put("area_usage_in_"+distrito+"_"+concelho+"_"+freguesia, areaUsage);

        return Response.ok(areaUsage).build();
    }

    //
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


        Object o = cache.get("distrito_by_parcel_count");
        AtomicReference<List<NamedCount>> distritoWithParcelCountsList = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setLimit(20)
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
            return v;
        });

        cache.put("distrito_by_parcel_count", g.toJson(distritoWithParcelCountsList.get()));

        return Response.ok(g.toJson(distritoWithParcelCountsList.get())).build();
    }

    //
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

        Object o = cache.get("concelho_by_parcel_count");
        AtomicReference<List<NamedCount>> distritoWithParcelCountsList = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setLimit(20)
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
            return v;
        });

        cache.put("concelho_by_parcel_count", g.toJson(distritoWithParcelCountsList.get()));

        return Response.ok(g.toJson(distritoWithParcelCountsList.get())).build();
    }

    //
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

        Object o = cache.get("parcel_area_by_usage_"+distrito);
        Map<String, Long> totalAreaByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

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


        cache.put("parcel_area_by_usage_"+distrito, g.toJson(finalTotalAreaByUsage));

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }


    //
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


        Object o = cache.get("parcel_area_by_usage_"+concelho);
        Map<String, Long> totalAreaByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

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


        cache.put("parcel_area_by_usage_"+concelho, g.toJson(finalTotalAreaByUsage));

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }

    //
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


        Object o = cache.get("parcel_area_by_usage_"+freguesia);
        Map<String, Long> totalAreaByUsage;

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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


        cache.put("parcel_area_by_usage_"+freguesia, g.toJson(finalTotalAreaByUsage));

        return Response.ok(g.toJson(finalTotalAreaByUsage)).build();
    }

    //
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

        if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();

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

        try {
            avgArea.set(totalParcelArea.get() / parcelCount.get());
        } catch (ArithmeticException e) {
            avgArea.set(0L);
        }

        cache.put("avg_total_parcel_area", avgArea.get());

        return Response.ok(avgArea.get()).build();
    }

    //
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

        if (parcelCount.get() != null)
            return Response.ok(parcelCount.get()).build();

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


    //
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

        if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();

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

    //
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

        results.forEachRemaining(p -> {
            totalArea.updateAndGet(v -> v + p.getLong("parcel_area"));
        });


        cache.put("total_parcel_area_in_concelho_"+freguesia+"_"+concelho+"_"+distrito, totalArea.get());

        return Response.ok(totalArea.get()).build();
    }

    //
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

        AtomicReference<Long> totalArea = new AtomicReference<>((Long) cache.get("parcel_count_in_concelho_"+freguesia+"_"+concelho+"_"+distrito));

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

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

    //
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


        Object o = cache.get("parcel_area_in_concelho_by_usage_"+freguesia+"_"+concelho+"_"+distrito);
        AtomicReference<Map<String, Long>> list = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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

        cache.put("parcel_area_in_concelho_by_usage_"+freguesia+"_"+concelho+"_"+distrito, g.toJson(list.get()));

        return Response.ok(g.toJson(list.get())).build();
    }

    //
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

        Object o = cache.get("parcel_count_in_concelho_by_usage" + freguesia + "_" + concelho + "_" + distrito);
        AtomicReference<Map<String, Long>> totalArea = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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


        cache.put("parcel_count_in_concelho_by_usage" + freguesia + "_" + concelho + "_" + distrito, g.toJson(totalArea.get()));

        return Response.ok(g.toJson(totalArea.get())).build();
    }


    /***********************************+
     * Tecnico B2
     */

    //
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

        if (avgArea.get() != null)
            return Response.ok(avgArea.get()).build();

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

    //
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

        if (totalArea.get() != null)
            return Response.ok(totalArea.get()).build();

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

    //
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

        Object o = cache.get("parcel_area_in_freguesia_by_usage_"+freguesia+"_"+concelho+"_"+distrito);
        AtomicReference<Map<String, Long>> list = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }


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

        cache.put("parcel_area_in_freguesia_by_usage_"+freguesia+"_"+concelho+"_"+distrito, g.toJson(list.get()));

        return Response.ok(g.toJson(list.get())).build();
    }


    //
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


        Object o = cache.get("parcel_count_in_freguesia_by_usage_"+freguesia+"_"+concelho+"_"+distrito);
        AtomicReference<Map<String, Long>> totalArea = new AtomicReference<>();

        if(o != null) {
            return Response.ok(o.toString()).build();
        }

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


        cache.put("parcel_count_in_freguesia_by_usage_"+freguesia+"_"+concelho+"_"+distrito, g.toJson(totalArea.get()));

        return Response.ok(g.toJson(totalArea.get())).build();
    }

    //
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

        Long totalArea = (Long) cache.get("parcel_count_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito);

        if (totalArea != null)
            return Response.ok(totalArea).build();

        QueryResults<Entity> results = datastore.run(
                Query.newEntityQueryBuilder()
                        .setKind("Parcel")
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_state", PARCEL_ACCEPTED_STATE))
                        .setFilter(StructuredQuery.PropertyFilter.eq("parcel_freguesia", user.getString("user_freguesia")))
                        .build()
        );

        totalArea = 0L;


        while(results.hasNext()){
            totalArea ++;
            results.next();
        }


        cache.put("parcel_count_in_freguesia_"+freguesia+"_"+concelho+"_"+distrito, totalArea);

        return Response.ok(totalArea).build();
    }
}