import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'main.dart';
import 'offline_pages.dart';

class ParcelListC extends StatefulWidget {
  const ParcelListC({super.key});

  @override
  State<ParcelListC> createState() => _ParcelListStateC();
}

class _ParcelListStateC extends State<ParcelListC> {
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
      Uri.parse('https://moonlit-oven-349523.appspot.com/rest/parcel/managed/'),
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
        msg = 'Confirme o seu e-mail para continuar ou aguarde que a sua conta seja ativada.';
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
        title: const Text("Sessão expirada"),
        content: const Text("Volte a iniciar sessão ou confirme o seu e-mail."),
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
    await prefs.remove('role');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Parcelas Entidade"),
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
              leading: getIcon(parcelList[index]['usage']),
              title: Text(parcelList[index]['name']),
              tileColor: Colors.green,
              textColor: Colors.white,
              subtitle: Text(parcelList[index]['freguesia']),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => MapC(
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
                  icon: const Icon(
                    Icons.download,
                    color: Colors.white,
                  )),
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

class MapC extends StatefulWidget {
  final double lat;
  final double lng;
  final List<dynamic> coordsList;
  final String parcelName;
  final String parcelID;

  const MapC(
      {Key? key,
        required this.lat,
        required this.lng,
        required this.coordsList,
        required this.parcelName,
        required this.parcelID})
      : super(key: key);

  @override
  _MapStateC createState() => _MapStateC();
}

class _MapStateC extends State<MapC> {
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