import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:startup/c_pages.dart';
import 'offline_pages.dart';

class AScreen extends StatelessWidget {
  const AScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Página Inicial Admin'),
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
        children: <Widget>[ParcelListA(), OfflineMap()],
      ),
    );
  }
}

class ParcelListA extends StatefulWidget {
  const ParcelListA({super.key});

  @override
  State<ParcelListA> createState() => _ParcelListStateA();
}

class _ParcelListStateA extends State<ParcelListA> {
  List<dynamic> parcelList = [];

  /*List<String> lista = ['Aveiro', 'Two', 'Three', 'Four'];
  List<String> _distritoList = ['Aveiro', 'Two', 'Three', 'Four'];
  Map<String, dynamic> _someMap = {};*/

  /*void getCSV() async{
    final prefs = await SharedPreferences.getInstance();

    if(prefs.getString('csv') == null || prefs.getInt('csvTime') == null || DateTime.now().millisecondsSinceEpoch.toInt()>prefs.getInt('csvTime')!){
      final response = await http.post(
        Uri.parse(
            'https://moonlit-oven-349523.appspot.com/rest/parcel/getCSV'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'token': prefs.getString('token')!
        }),
      );

      if(response.statusCode == 200){
        try{
          String csv = response.body;
          List lines = csv.split('\n');
          final Map<String, Map<String, Map<String, String>>> someMap = {};

          for(var i = 1; i<lines.length; i++){
            List currentLine = lines[i].split(';');

            if(!(currentLine == null) && currentLine.isNotEmpty && currentLine.length>1){
              String distrito = currentLine[1];
              someMap.putIfAbsent(distrito, () => {});

              String concelho = currentLine[2];
              someMap[distrito]?.putIfAbsent(concelho, () => {});

              String freguesia = currentLine[3];
              someMap[distrito]![concelho]?.putIfAbsent(freguesia, () => currentLine[4]);
            }
          }
          String mapString = jsonEncode(someMap);
          prefs.setString('csv', mapString);
          prefs.setInt('csvTime', DateTime.now().millisecondsSinceEpoch.toInt() + (1000*60*60*24*7));
        }
        catch(e){
          print("Catch Exception is $e");
          print(e.toString());
        }
      }
    }
    else{
      String mapString = prefs.getString('csv')!;

      setState(() {
        _someMap = jsonDecode(mapString);
        _distritoList = _someMap.keys.toList();
      });
      print(_distritoList);
    }
  }

  @override
  void initState() {
    getCSV();
    super.initState();
  }*/

  Future<List<dynamic>> getOwned(
      String distrito, String concelho, String freguesia) async {
    final prefs = await SharedPreferences.getInstance();
    final String token = prefs.getString('token') ?? "";

    final response = await http.post(
      Uri.parse(
          'https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/approvedbyregion/$distrito/$concelho/$freguesia'),
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

    setState(() {});
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final distrito = TextEditingController();
    final concelho = TextEditingController();
    final freguesia = TextEditingController();
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: <Widget>[
          /*const DropDown(
              optionList: valueList,
              option: value),
          DropDown(
              optionList: lista,
              option: dropdownValue2),
          DropDown(
              optionList: lista,
              option: dropdownValue2),*/
          SizedBox(
            height: 20.0,
            width: 100.0,
            child: TextField(
              controller: distrito,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Distrito',
              ),
            ),
          ),
          SizedBox(
            height: 20.0,
            width: 100.0,
            child: TextField(
              controller: concelho,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Concelho',
              ),
            ),
          ),
          SizedBox(
            height: 20.0,
            width: 100.0,
            child: TextField(
              controller: freguesia,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Freguesia',
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle),
            onPressed: () =>
                {getOwned(distrito.text, concelho.text, freguesia.text)},
          )
        ],
      ),
      body: ListView.builder(
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
                  onPressed: () {},
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

class MapA extends StatefulWidget {
  final double lat;
  final double lng;
  final List<dynamic> coordsList;
  final String parcelName;
  final String parcelID;

  const MapA(
      {Key? key,
      required this.lat,
      required this.lng,
      required this.coordsList,
      required this.parcelName,
      required this.parcelID})
      : super(key: key);

  @override
  _MapStateA createState() => _MapStateA();
}

class _MapStateA extends State<MapA> {
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
              icon: const Icon(Icons.settings),
              onPressed: () => {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => EditMapA(
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

class EditMapA extends StatefulWidget {
  final String parcelName;
  final String parcelID;
  final List<dynamic> coordsList;
  const EditMapA(
      {Key? key,
      required this.parcelName,
      required this.parcelID,
      required this.coordsList})
      : super(key: key);

  @override
  _EditMapStateA createState() => _EditMapStateA();
}

class _EditMapStateA extends State<EditMapA> {
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
                      builder: (context) => const DefaultTabController(
                        length: 2,
                        child: AScreen(),
                      ),
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
          'https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/modify/${widget.parcelID}/coordinates'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'token': token,
        'coordinates': jsonEncode(c),
        'area': area.abs().toInt().toString(),
        'perimeter': perimeter.abs().toInt().toString()
      }),
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
                icon: const Icon(Icons.settings),
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
                    onPressed: () => {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => ShowCoordsA(pointList)))
                        },
                    icon: const Icon(Icons.save)),
              )
            ],
          )),
    );
  }
}

class ShowCoordsA extends StatelessWidget {
  const ShowCoordsA(this.coords);

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

class DropDown extends StatefulWidget {
  final List<String> optionList;
  final String option;
  const DropDown({Key? key, required this.optionList, required this.option})
      : super(key: key);

  @override
  State<DropDown> createState() => _DropDownState();
}

class _DropDownState extends State<DropDown> {
  String dropdownValue = 'One';

  @override
  Widget build(BuildContext context) {
    return DropdownButton<String>(
      value: dropdownValue,
      icon: const Icon(Icons.arrow_downward),
      elevation: 16,
      style: const TextStyle(color: Colors.deepPurple),
      underline: Container(
        height: 2,
        color: Colors.deepPurpleAccent,
      ),
      onChanged: (String? newValue) {
        setState(() {
          dropdownValue = newValue!;
        });
      },
      items: widget.optionList.map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList(),
    );
  }
}
