class LoginInfo {
  final String username;
  final String password;

  const LoginInfo({required this.username, required this.password});

  factory LoginInfo.fromJson(Map<String, dynamic> json) {
    return LoginInfo(
      username: json['username'],
      password: json['password'],
    );
  }
}