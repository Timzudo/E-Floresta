import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'offline_pages.dart';

class CScreen extends StatelessWidget {
  const CScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Página Inicial Entidade'),
        automaticallyImplyLeading: true,
        bottom: const TabBar(
          tabs: <Widget>[
            Tab(
              text: "Parcelas",
            ),
            Tab(
              text: "Estatísticas",
            ),
          ],
        ),
      ),
      body: const TabBarView(
        physics: NeverScrollableScrollPhysics(),
        children: <Widget>[ParcelListC(), OfflineMap()],
      ),
    );
  }
}

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

    final response = await http.post(
      Uri.parse(
          'https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/managed/'),
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
      /*appBar: AppBar(
          title: const Text("Lista de parcelas"),
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
                onPressed: () {
                  logout();
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.exit_to_app_rounded))
          ],
        ),*/
      body:
      ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: parcelList.isNotEmpty ? parcelList.length * 2 : 0,
          itemBuilder: (context, i) {
            if (i.isOdd) return const Divider();
            final index = i ~/ 2;
            return ListTile(
              leading: const Icon(Icons.landscape_outlined),
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
                    /*removeParcel(parcelList[index]['name']);
                      Navigator.of(context).pop();
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const DefaultTabController(
                              length: 2,
                              child: OfflineScreen(),
                            )),
                      );*/
                  },
                  icon: const Icon(Icons.exit_to_app_rounded)),
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
        child: const Icon(Icons.map),
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