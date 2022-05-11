package firstwebapp.resources;

import com.google.cloud.datastore.*;

import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.logging.Logger;

@Path("/logout")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class LogoutResource {

    private static final Logger LOG = Logger.getLogger(LoginResource.class.getName());

    private final Datastore datastore = DatastoreOptions.getDefaultInstance().getService();


    @DELETE
    @Path("/{tokenId}")
    public Response logout(@PathParam("tokenId") String tokenId){
        LOG.fine("Logout attempt by tokenId: " + tokenId);

        Key tokenKey = datastore.newKeyFactory().setKind("Token").newKey(tokenId);
        Entity token = datastore.get(tokenKey);

        if(token == null){
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Query<Entity> query = Query.newEntityQueryBuilder()
                .setKind("Token")
                .setFilter(StructuredQuery.PropertyFilter.eq("token_username", token.getString("token_username")))
                .build();

        QueryResults<Entity> tokens = datastore.run(query);

        Transaction txn = datastore.newTransaction();

        try{
            tokens.forEachRemaining(auxToken -> {
                txn.delete(auxToken.getKey());
            });
            LOG.info("TokenId: " + tokenId + " logged out sucessfully.");
            txn.commit();
        }
        finally {
            if(txn.isActive()){
                txn.rollback();
            }
        }
        return Response.ok().build();
    }
}
