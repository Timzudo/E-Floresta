import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui' as ui;

Future<Uint8List?> getBytesFromAsset(String path, int width) async {
  ByteData data = await rootBundle.load(path);
  ui.Codec codec = await ui.instantiateImageCodec(data.buffer.asUint8List(), targetWidth: width);
  ui.FrameInfo fi = await codec.getNextFrame();
  return (await fi.image.toByteData(format: ui.ImageByteFormat.png))?.buffer.asUint8List();
}


class OfflineScreen extends StatelessWidget {
  const OfflineScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Offline'),
        bottom: const TabBar(
          tabs: <Widget>[
            Tab(
              text: "Parcelas Guardadas",
            ),
            Tab(
              text: "Desenhar",
            ),
          ],
        ),
      ),
      body: const TabBarView(
        physics: NeverScrollableScrollPhysics(),
        children: <Widget>[OfflineParcels(), OfflineMap()],
      ),
    );
  }
}

class OfflineParcels extends StatefulWidget {
  const OfflineParcels({super.key});

  @override
  State<OfflineParcels> createState() => _OfflineParcelsState();
}

class _OfflineParcelsState extends State<OfflineParcels> {
  List<dynamic> parcelList = [];

  @override
  void initState() {
    getOwned().whenComplete(() => setState(() {}));
    super.initState();
  }

  Future<List<dynamic>> getOwned() async {
    final prefs = await SharedPreferences.getInstance();
    String parcelIndexString = prefs.getString('offline')!;

    dynamic parcelIndex = jsonDecode(parcelIndexString);

    List<dynamic> finalList = [];

    for (var i = 0; i < parcelIndex.length; i++) {
      String nome = parcelIndex[i];
      String parcelCoords = prefs.getString(nome)!;
      List mapList = jsonDecode(parcelCoords);
      dynamic map = {'name': nome, 'coordinates': mapList};
      parcelList.add(map);
      finalList.add(map);
    }

    return finalList;
  }

  void removeParcel(String name) async {
    final prefs = await SharedPreferences.getInstance();

    if (name.isNotEmpty) {
      await prefs.remove(name);

      String offline = prefs.getString("offline")!;
      List offlineList = jsonDecode(offline);

      offlineList.remove(name);

      await prefs.setString('offline', jsonEncode(offlineList));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
        itemCount: parcelList.isNotEmpty ? parcelList.length * 2 : 0,
        itemBuilder: (context, i) {
          if (i.isOdd) return const Divider();
          final index = i ~/ 2;
          return ListTile(
            leading: const Icon(Icons.landscape_outlined),
            title: Text(parcelList[index]['name'].split("_")[0]),
            tileColor: Colors.green,
            textColor: Colors.white,
            onTap: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Map(
                        lat: 39.137251,
                        lng: -8.378835,
                        coordsList: (parcelList[index]['coordinates'])),
                  ));
            },
            trailing: IconButton(
                onPressed: () {
                  removeParcel(parcelList[index]['name']);
                  Navigator.of(context).pop();
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const DefaultTabController(
                              length: 2,
                              child: OfflineScreen(),
                            )),
                  );
                },
                icon: const Icon(Icons.exit_to_app_rounded)),
          );
        },
      ),
    );
  }
}

class OfflineMap extends StatefulWidget {
  const OfflineMap({Key? key}) : super(key: key);

  @override
  _OfflineMapState createState() => _OfflineMapState();
}

class _OfflineMapState extends State<OfflineMap> {
  late GoogleMapController mapController;

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }


  List<LatLng> pointList = [];
  LatLng _lastMapPosition = const LatLng(38.660787, -9.207663);
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

  @override
  Widget build(BuildContext context) {
    setState(() {
      _currentMapType = _currentMapType;
    });
    return MaterialApp(
      home: Scaffold(
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
                  Polygon(
                      polygonId: const PolygonId('test'),
                      points: pointList.isNotEmpty
                          ? pointList
                          : [const LatLng(38.802711, -9.263537)],
                      strokeWidth: 2,
                      strokeColor: Colors.blueAccent,
                      fillColor: Colors.blue.withOpacity(0.4))
                },
                onMapCreated: _onMapCreated,
                onCameraMove: _onCameraMove,
                initialCameraPosition: CameraPosition(
                  target: _lastMapPosition,
                  zoom: 14.0,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 114.0, horizontal: 4.0),
                child: IconButton(
                    iconSize: 40.0,
                    onPressed: addPoint,
                    icon: const Icon(Icons.add_box_rounded)),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 174.0, horizontal: 4.0),
                child: IconButton(
                    iconSize: 40.0,
                    onPressed: removePoint,
                    icon: const Icon(Icons.assignment_return_rounded)),
              ),
              const Center(child: Icon(Icons.adjust)),
              Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 54.0, horizontal: 4.0),
                child: IconButton(
                    iconSize: 40.0,
                    onPressed: () => {saveOfflineParcel(pointList, context)},
                    icon: const Icon(Icons.save)),
              )
            ],
          )),
    );
  }
}

void saveOfflineParcel(List<LatLng> pointList, BuildContext context) async {
  final parcelNameController = TextEditingController();

  Future<void> saveParcel() async {
    final prefs = await SharedPreferences.getInstance();
    String name = parcelNameController.text;

    if (name.isNotEmpty) {
      List list = [];
      for (var i = 0; i < pointList.length; i++) {
        dynamic mapa = {
          'lat': pointList[i].latitude,
          'lng': pointList[i].longitude
        };
        list.add(mapa);
      }

      String listString = jsonEncode(list);
      await prefs.setString("offline_$name", listString);
      String? parcelList = prefs.getString('offline');
      if (parcelList == null) {
        await prefs.setString("offline", "");
        parcelList = "";
      }
      List newList = parcelList.isEmpty ? [] : jsonDecode(parcelList);
      newList.add("offline_$name");
      await prefs.setString("offline", jsonEncode(newList));
    }
  }

  Widget insertNameButton = TextButton(
    child: const Text("OK"),
    onPressed: () {
      Future<void> v = saveParcel();
      v.whenComplete(() => {
            Navigator.of(context).pop(),
            Navigator.of(context).pop(),
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const DefaultTabController(
                        length: 2,
                        child: OfflineScreen(),
                      )),
            )
          });
    },
  );

  AlertDialog alert = AlertDialog(
    title: const Text("Insira o nome da parcela"),
    content: TextField(
      controller: parcelNameController,
    ),
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

class Map extends StatefulWidget {
  final double lat;
  final double lng;
  final List<dynamic> coordsList;

  const Map(
      {Key? key,
      required this.lat,
      required this.lng,
      required this.coordsList})
      : super(key: key);

  @override
  _MapState createState() => _MapState();
}

class _MapState extends State<Map> {
  late GoogleMapController mapController;

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Set<Polygon> myPolygon() {
    List<LatLng> polygonCoords = [];

    for (int i = 0; i < widget.coordsList.length; i++) {
      print(widget.coordsList[i]);
      polygonCoords.add(
          LatLng(widget.coordsList[i]['lat'], widget.coordsList[i]['lng']));
    }

    Set<Polygon> polygonSet = {};
    polygonSet.add(Polygon(
        polygonId: const PolygonId('test'),
        points: polygonCoords,
        strokeWidth: 2,
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
          title: const Text('Visualizador de parcelas'),
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
              widget.coordsList[0]['lat'],
              widget.coordsList[0]['lng'],
            ),
            zoom: 16.0,
          ),
        ),
      ),
    );
  }
}
