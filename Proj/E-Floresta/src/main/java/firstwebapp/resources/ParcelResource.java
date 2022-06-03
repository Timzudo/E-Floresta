package firstwebapp.resources;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.gson.Gson;
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
    @Path("/{parcelI}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerParcel(@PathParam("parcelI") String parcelI, ParcelInfo parcelInfo){
        System.out.println(parcelInfo.name);
        return Response.ok().build();
    }


}
