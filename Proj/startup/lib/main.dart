import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

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
      /*body: Center(
        child: FractionallySizedBox(
          widthFactor: 0.9,
          heightFactor: 0.8,
          child: LoginForm(),
        ),
      ),*/
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
    Uri.parse(
        'https://moonlit-oven-349523.oa.r.appspot.com/rest/login/$username'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        Navigator.of(context).pop();
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ParcelList()),
        );
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
        'https://moonlit-oven-349523.oa.r.appspot.com/rest/register/personal/"$username'),
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
    // set up the button
    Widget okButton = TextButton(
      child: const Text("OK"),
      onPressed: () {
        Navigator.of(context).pop();
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ParcelList()),
        );
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

class _ParcelListState extends State<ParcelList> {

   Map<String, dynamic> parcelList;

  @override
  void initState() {
    super.initState();
    parcelList = getOwned("username") as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("asd")),
        body: ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: parcelList.isNotEmpty ? parcelList.length : 0,
            itemBuilder: (context, i) {
              return ListTile(
                title: Text(parcelList[i]['name']),
                tileColor: Colors.green,
              );
            }));
  }
}

Future<Map<String, dynamic>?> getOwned(String username) async {
  final response = await http.post(
    Uri.parse(
        'https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/owned/'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'token':
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0aW0iLCJyb2xlIjoiQyIsImlzcyI6IkUtRmxvcmVzdGEiLCJleHAiOjE2NTY4OTk5MDN9.SLxovfWVKcMAX5IiskiAlT2xdT_Y4i9tMrfSjjN9WyI'
    }),
  );

  Map<String, dynamic>? map;
  if (response.statusCode == 200) {
    map = jsonDecode(response.body);
  }
  else{
    map = null;
  }

  return map;
}

class ParcelList extends StatefulWidget {
  const ParcelList({super.key});

  @override
  State<ParcelList> createState() => _ParcelListState();
}
