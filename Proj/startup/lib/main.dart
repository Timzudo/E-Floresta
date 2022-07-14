import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:startup/c_pages.dart';
import 'a_pages.dart';
import 'b_pages.dart';
import 'offline_pages.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  runApp(const MyApp());
}

Icon getIcon(String usage){
  switch(usage){
    case 'Recreacional':{
      return const Icon(Icons.sports_tennis_outlined, color: Colors.white);
    }
    case 'Transporte':{
      return const Icon(Icons.directions_bus, color: Colors.white);
    }
    break;
    case 'Agricultural':{
      return const Icon(Icons.agriculture_outlined, color: Colors.white);
    }
    break;
    case 'Residencial':{
      return const Icon(Icons.house_outlined, color: Colors.white);
    }
    break;
    case 'Comercial':{
      return const Icon(Icons.shopping_bag_outlined, color: Colors.white);
    }
    case 'Pasto':{
      return const Icon(Icons.grass, color: Colors.white);
    }
    break;
    case 'Floresta':{
      return const Icon(Icons.forest_outlined, color: Colors.white);
    }
    break;
    case 'Privado':{
      return const Icon(Icons.sports_tennis_outlined, color: Colors.white);
    }
    break;
    default: {
      return const Icon(Icons.landscape_outlined, color: Colors.white);
    }
    break;
  }
}

Future<void> requestPermissions() async {
  Permission.location.request();
  Map<Permission, PermissionStatus> statuses = await [
    Permission.location,
    Permission.locationAlways,
    Permission.locationWhenInUse
  ].request();

  if (statuses[Permission.location].toString() != 'PermissionStatus.granted' &&
      statuses[Permission.locationAlways].toString() !=
          'PermissionStatus.granted' &&
      statuses[Permission.locationWhenInUse].toString() !=
          'PermissionStatus.granted') {
    openAppSettings();
  }
}


class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    requestPermissions();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'E-Floresta',
      theme: ThemeData(
        // Add the 5 lines from here...
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
        ),
      ),
      home: const DefaultTabController(
        length: 2,
        child: LoginScreen(),
      ),
    );
  }
}

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('E-Floresta'),
        bottom: const TabBar(
          tabs: <Widget>[
            Tab(
              text: "Iniciar sessão",
            ),
            Tab(
              /*icon: Icon(Icons.beach_access_sharp),*/
              text: "Criar conta",
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const DefaultTabController(
                length: 2,
                child: OfflineScreen(),
              ),
            ),
          )
        },
        heroTag: null,
        child: const Icon(Icons.map),
      ),
      body: TabBarView(
        children: <Widget>[
          Center(
            child: FractionallySizedBox(
              widthFactor: 0.9,
              heightFactor: 0.8,
              child: LoginForm(),
            ),
          ),
          Center(
            child: FractionallySizedBox(
              widthFactor: 0.9,
              heightFactor: 0.8,
              child: RegisterForm(),
            ),
          ),
        ],
      ),
    );
  }
}

class LoginForm extends StatelessWidget {
  LoginForm({Key? key}) : super(key: key);
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        const SizedBox(height: 20),
        Image.asset(
          'assets/images/logo.png',
          height: 200,
          width: 200,
        ),
        const SizedBox(height: 30),
        TextField(
            controller: usernameController,
            decoration: const InputDecoration(
              hintText: 'Username',
            )),
        const SizedBox(height: 18),
        TextField(
            obscureText: true,
            controller: passwordController,
            decoration: const InputDecoration(
              hintText: 'Password',
            )),
        const SizedBox(height: 18),
        SizedBox(
            width: 400,
            child: ElevatedButton(
                style: ElevatedButton.styleFrom(primary: Colors.green),
                onPressed: () => loginRequest(
                    usernameController.text, passwordController.text, context),
                child: const Text('LOGIN')))
      ],
    );
  }
}

class RegisterForm extends StatelessWidget {
  RegisterForm({Key? key}) : super(key: key);
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmationController = TextEditingController();
  final emailController = TextEditingController();
  final nameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        const SizedBox(height: 20),
        TextField(
            controller: usernameController,
            decoration: const InputDecoration(
              hintText: 'Username',
            )),
        const SizedBox(height: 18),
        TextField(
            controller: emailController,
            decoration: const InputDecoration(
              hintText: 'E-mail',
            )),
        const SizedBox(height: 18),
        TextField(
            controller: nameController,
            decoration: const InputDecoration(
              hintText: 'Nome completo',
            )),
        const SizedBox(height: 18),
        TextField(
            obscureText: true,
            controller: passwordController,
            decoration: const InputDecoration(
              hintText: 'Password',
            )),
        const SizedBox(height: 18),
        TextField(
            obscureText: true,
            controller: confirmationController,
            decoration: const InputDecoration(
              hintText: 'Confirmation',
            )),
        const SizedBox(height: 18),
        SizedBox(
            width: 400,
            child: ElevatedButton(
                style: ElevatedButton.styleFrom(primary: Colors.green),
                onPressed: () => registerRequest(
                    usernameController.text,
                    emailController.text,
                    nameController.text,
                    passwordController.text,
                    confirmationController.text,
                    context),
                child: const Text('CRIAR CONTA')))
      ],
    );
  }
}

void loginRequest(
    String username, String password, BuildContext context) async {
  final response = await http.post(
    Uri.parse('https://moonlit-oven-349523.appspot.com/rest/login/$username'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final prefs = await SharedPreferences.getInstance();
    String token = response.body;
    String payload = token.split('.')[1];
    int length = payload.length;
    var decoded = base64.decode(base64.normalize(payload));
    String obj = utf8.decode(decoded);
    String role = jsonDecode(obj)['role'];
    await prefs.setString('role', role);
    await prefs.setString('token', token);
    await prefs.setString('state', jsonDecode(obj)['state']);

    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        print(role);

        Navigator.of(context).pop();
        if (role == 'D') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelList()),
            ),
          );
        } else if (role == 'C') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListC()),
            ),
          );
        } else if (role == 'B1' || role == 'B2') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListB()),
            ),
          );
        } else if (role == 'A1' || role == 'A2') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListA()),
            ),
          );
        }
      },
    );
    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: const Text("LOGIN"),
      content: Text("User $username logged in successfully."),
      actions: [
        okButton,
      ],
    );
    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  } else {
    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () => {
        Navigator.of(context).pop(),
      },
    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: const Text("LOGIN"),
      content: const Text("There was an error loggin in."),
      actions: [
        okButton,
      ],
    );

    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }
}

void registerRequest(String username, String email, String name,
    String password, String confirmation, BuildContext context) async {
  final response = await http.post(
    Uri.parse(
        'https://moonlit-oven-349523.appspot.com/rest/register/personal/$username'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'password': password,
      'confirmation': confirmation,
      'email': email,
      'name': name,
      'phone': "",
      'nif': ""
    }),
  );

  if (response.statusCode == 200) {
    final prefs = await SharedPreferences.getInstance();
    String token = response.body;
    var decoded = base64.decode(base64.normalize(token.split('.')[1]));
    String obj = utf8.decode(decoded);
    String role = jsonDecode(obj)['role'];
    await prefs.setString('role', role);
    await prefs.setString('token', token);
    await prefs.setString('state', 'INACTIVE');
    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        Navigator.of(context).pop();
        if (role == 'D') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelList()),
            ),
          );
        } else if (role == 'C') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListC()),
            ),
          );
        } else if (role == 'B1' || role == 'B2') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListB()),
            ),
          );
        } else if (role == 'A1' || role == 'A2') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => WillPopScope(onWillPop: () async {return false;}, child: const ParcelListA()),
            ),
          );
        }
      },
    );
    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: const Text("LOGIN"),
      content: Text("User $username created successfully."),
      actions: [
        okButton,
      ],
    );
    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  } else {
    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        Navigator.of(context).pop();
      },
    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: const Text("LOGIN"),
      content: const Text("There was an error creating the account."),
      actions: [
        okButton,
      ],
    );

    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }
}

class ParcelList extends StatefulWidget {
  const ParcelList({super.key});

  @override
  State<ParcelList> createState() => _ParcelListState();
}

class _ParcelListState extends State<ParcelList> {
  List<dynamic> parcelList = [];

  @override
  void initState() {
    getOwned().whenComplete(() => setState(() {}));
    super.initState();
  }

  Future<List<dynamic>> getOwned() async {
    final prefs = await SharedPreferences.getInstance();
    final String token = prefs.getString('token') ?? "";
    final String state = prefs.getString('state') ?? "";

    final response = await http.post(
      Uri.parse('https://moonlit-oven-349523.appspot.com/rest/parcel/owned/'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{'token': token}),
    );

    dynamic map;
    if (response.statusCode == 200) {
      map = jsonDecode(utf8.decode(response.bodyBytes));
      parcelList = map;
    } else {
      String title;
      String msg;
      if(state == "ACTIVE"){
        title = 'Sessão expirada';
        msg = 'Volte a iniciar sessão.';
      }
      else{
        title = 'Conta inativa';
        msg = 'Confirme o seu e-mail para continuar.';
      }

      Widget okButton = TextButton(
        child: const Text("OK"),
        onPressed: () {
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        },
      );
      // set up the AlertDialog
      AlertDialog alert = AlertDialog(
        title: Text(title),
        content: Text(msg),
        actions: [
          okButton,
        ],
      );
      // show the dialog
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return alert;
        },
      );
      map = response.statusCode;
    }

    return map;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Parcelas Utilizador"),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
              onPressed: () {
                logout();
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.exit_to_app_rounded))
        ],
      ),
      body: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: parcelList.isNotEmpty ? parcelList.length * 2 : 0,
          itemBuilder: (context, i) {
            if (i.isOdd) return const Divider();
            final index = i ~/ 2;
            return ListTile(
              leading:
              getIcon(parcelList[index]['usage']),
              title: Text(parcelList[index]['name']),
              tileColor: Colors.green,
              textColor: Colors.white,
              subtitle: Text(parcelList[index]['freguesia']),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => MapM(
                        lat: 39.137251,
                        lng: -8.378835,
                        coordsList:
                        jsonDecode(parcelList[index]['coordinates']),
                        parcelName: parcelList[index]['name'],
                        parcelID: (parcelList[index]['owner'] +
                            '_' +
                            parcelList[index]['name']),
                      )),
                );
              },
              trailing: IconButton(
                  onPressed: () {
                    List<dynamic> coordsList =
                    jsonDecode(parcelList[index]['coordinates']);
                    List<LatLng> polygonCoords = [];

                    for (int i = 0; i < coordsList.length; i++) {
                      polygonCoords.add(
                          LatLng(coordsList[i]['lat'], coordsList[i]['lng']));
                    }

                    saveOfflineParcel(polygonCoords, context);
                  },
                  icon: const Icon(Icons.download, color: Colors.white)),
            );
          }),
      floatingActionButton: FloatingActionButton(
        onPressed: () => {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const DefaultTabController(
                length: 2,
                child: OfflineScreen(),
              ),
            ),
          )
        },
        heroTag: null,
        child: const Icon(Icons.wifi_off),
      ),
    );
  }
}

class MapM extends StatefulWidget {
  final double lat;
  final double lng;
  final List<dynamic> coordsList;
  final String parcelName;
  final String parcelID;

  const MapM(
      {Key? key,
        required this.lat,
        required this.lng,
        required this.coordsList,
        required this.parcelName,
        required this.parcelID})
      : super(key: key);

  @override
  _MapState createState() => _MapState();
}

class _MapState extends State<MapM> {
  late GoogleMapController mapController;

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Set<Polygon> myPolygon() {
    List<LatLng> polygonCoords = [];

    for (int i = 0; i < widget.coordsList.length; i++) {
      polygonCoords.add(
          LatLng(widget.coordsList[i]['lat'], widget.coordsList[i]['lng']));
    }

    Set<Polygon> polygonSet = {};
    polygonSet.add(Polygon(
        polygonId: const PolygonId('test'),
        points: polygonCoords,
        strokeWidth: 3,
        strokeColor: Colors.blueAccent,
        fillColor: Colors.blue.withOpacity(0.4)));

    return polygonSet;
  }

  MapType _currentMapType = MapType.normal;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text(widget.parcelName),
          backgroundColor: Colors.green[700],
          automaticallyImplyLeading: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () => {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => EditMap(
                            parcelName: widget.parcelName,
                            parcelID: widget.parcelID,
                            coordsList: widget.coordsList)))
              },
            ),
            // add more IconButton
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => {
            setState(() {
              _currentMapType = (_currentMapType == MapType.normal)
                  ? MapType.satellite
                  : MapType.normal;
            })
          },
          heroTag: null,
          child: const Icon(Icons.layers),
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
        body: GoogleMap(
          myLocationEnabled: true,
          mapType: _currentMapType,
          polygons: myPolygon(),
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: LatLng(
                widget.coordsList[0]['lat'], widget.coordsList[0]['lng']),
            zoom: 16.0,
          ),
        ),
      ),
    );
  }
}

class EditMap extends StatefulWidget {
  final String parcelName;
  final String parcelID;
  final List<dynamic> coordsList;
  const EditMap(
      {Key? key,
        required this.parcelName,
        required this.parcelID,
        required this.coordsList})
      : super(key: key);

  @override
  _EditMapState createState() => _EditMapState();
}

class _EditMapState extends State<EditMap> {
  late GoogleMapController mapController;

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Polygon myPolygon() {
    List<LatLng> polygonCoords = [];

    for (int i = 0; i < widget.coordsList.length; i++) {
      polygonCoords.add(
          LatLng(widget.coordsList[i]['lat'], widget.coordsList[i]['lng']));
    }

    return Polygon(
        polygonId: const PolygonId('test'),
        points: polygonCoords,
        strokeWidth: 3,
        strokeColor: Colors.purpleAccent,
        fillColor: Colors.purple.withOpacity(0.2));
  }

  List<LatLng> pointList = [];
  LatLng _lastMapPosition = const LatLng(38.662295, -9.207663);
  MapType _currentMapType = MapType.normal;

  void _onCameraMove(CameraPosition position) {
    _lastMapPosition = position.target;
  }

  Set<Marker> getMarkers() {
    Set<Marker> markers = {};
    for (int i = 0; i < pointList.length; i++) {
      markers.add(
          Marker(markerId: MarkerId(i.toString()), position: pointList[i]));
    }
    return markers;
  }

  void addPoint() {
    pointList.add(_lastMapPosition);
    setState(() {
      _currentMapType = _currentMapType;
    });
  }

  void removePoint() {
    pointList.removeLast();
    setState(() {
      _currentMapType = _currentMapType;
    });
  }

  void confirmRequest() {
    Widget insertNameButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        sendEditRequest().then((value) => {
          if (value)
            {
              Navigator.of(context).pop(),
              Navigator.of(context).pop(),
              Navigator.of(context).pop(),
              Navigator.of(context).pop(),
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ParcelList(),
                ),
              )
            }
        });
      },
    );

    AlertDialog alert = AlertDialog(
      title: const Text("Pretende alterar a parcela?"),
      actions: [
        insertNameButton,
      ],
    );
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }

  Future<bool> sendEditRequest() async {
    final prefs = await SharedPreferences.getInstance();
    final String token = prefs.getString('token') ?? "";
    List c = [];
    double area = 0;
    double perimeter = 0;

    for (var i = 0; i < pointList.length; i++) {
      if (i < pointList.length - 1) {
        area += ConvertToRadian(
            pointList[i + 1].longitude - pointList[i].longitude) *
            (sin(ConvertToRadian(pointList[i].latitude)) +
                sin(ConvertToRadian(pointList[i + 1].latitude)));
        perimeter += sqrt(
            pow(pointList[i + 1].latitude - pointList[i].latitude * 110000, 2) +
                pow(pointList[i + 1].longitude - pointList[i].longitude, 2));
      }
      c.add({'lat': pointList[i].latitude, 'lng': pointList[i].longitude});
    }
    area += ConvertToRadian(pointList[0].longitude -
        pointList[pointList.length - 1].longitude) *
        (sin(ConvertToRadian(pointList[pointList.length - 1].latitude)) +
            sin(ConvertToRadian(pointList[0].latitude)));
    area = area * 6378137 * 6378137 / 2;
    perimeter += sqrt(pow(
        pointList[0].latitude - pointList[pointList.length - 1].latitude,
        2) +
        pow(pointList[0].longitude - pointList[pointList.length - 1].longitude,
            2));
    perimeter *= 100000;

    final response = await http.post(
      Uri.parse(
          'https://moonlit-oven-349523.appspot.com/rest/parcel/modify/${widget.parcelID}/coordinates'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(
          <String, String>{'token': token, 'coordinates': jsonEncode(c)}),
    );

    return response.statusCode == 200;
  }

  double ConvertToRadian(double input) {
    return input * pi / 180;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
          appBar: AppBar(
            title: Text('Editar ${widget.parcelName}'),
            backgroundColor: Colors.green[700],
            automaticallyImplyLeading: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.check_box_rounded),
                onPressed: () => {confirmRequest()},
              ),
              // add more IconButton
            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () => {
              setState(() {
                _currentMapType = (_currentMapType == MapType.normal)
                    ? MapType.satellite
                    : MapType.normal;
              })
            },
            heroTag: null,
            child: const Icon(Icons.layers),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
          body: Stack(
            children: [
              GoogleMap(
                myLocationEnabled: true,
                mapType: _currentMapType,
                markers: getMarkers(),
                polygons: {
                  myPolygon(),
                  Polygon(
                    polygonId: const PolygonId('test'),
                    points: pointList.isNotEmpty
                        ? pointList
                        : [const LatLng(38.802711, -9.263537)],
                    strokeWidth: 3,
                    strokeColor: Colors.blueAccent,
                    fillColor: Colors.blue.withOpacity(0.4),
                  )
                },
                onMapCreated: _onMapCreated,
                onCameraMove: _onCameraMove,
                initialCameraPosition: CameraPosition(
                  target: LatLng(
                      widget.coordsList[0]['lat'], widget.coordsList[0]['lng']),
                  zoom: 16.0,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 114.0, horizontal: 4.0),
                child: IconButton(
                    iconSize: 40.0,
                    onPressed: addPoint,
                    icon: const Icon(Icons.add_location_alt_rounded)),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 174.0, horizontal: 4.0),
                child: IconButton(
                    iconSize: 40.0,
                    onPressed: removePoint,
                    icon: const Icon(Icons.undo)),
              ),
              const Center(child: Icon(Icons.adjust)),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 54.0, horizontal: 4.0),
              )
            ],
          )),
    );
  }
}

class ShowCoords extends StatelessWidget {
  const ShowCoords(this.coords);

  final List<LatLng> coords;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Lista de pontos"),
      ),
      body: ListView.builder(
        itemCount: coords.isNotEmpty ? coords.length * 2 : 0,
        itemBuilder: (context, i) {
          if (i.isOdd) return const Divider();
          final index = i ~/ 2;
          double lat =
          double.parse((coords[index].latitude).toStringAsFixed(6));
          double lng =
          double.parse((coords[index].longitude).toStringAsFixed(6));
          return ListTile(
            leading: const Icon(Icons.landscape_outlined),
            title: Text((index + 1).toString()),
            tileColor: Colors.green,
            textColor: Colors.white,
            subtitle: Text("Lat: $lat \nLng: $lng"),
          );
        },
      ),
    );
  }
}