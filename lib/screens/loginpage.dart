import 'package:flutter/material.dart';
import 'package:hrd_radian/screens/main_homepage.dart';
import 'package:hrd_radian/utils/responsive.dart';
import 'package:icons_flutter/icons_flutter.dart';

class Loginpage extends StatefulWidget {
  const Loginpage({super.key});

  @override
  State<Loginpage> createState() => _LoginpageState();
}

class _LoginpageState extends State<Loginpage> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage("assets/img/bg_login.png"),
          fit: BoxFit.fill,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.only(
                top: Responsive.isMobile(context) ? 50 : 150, 
                bottom: 50,
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      constraints: BoxConstraints(maxWidth: 500),
                      width: Responsive.isMobile(context) ? double.infinity : 500,
                      margin: EdgeInsets.symmetric(horizontal: Responsive.isMobile(context) ? 20 : 0),
                      padding: EdgeInsets.symmetric(
                        vertical: Responsive.isMobile(context) ? 30 : 50,
                        horizontal: Responsive.isMobile(context) ? 25 : 60,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.grey, width: 2),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey,
                            blurRadius: 10,
                            spreadRadius: 5,
                            offset: Offset(0, 9),
                          ),
                        ],
                      ),
                      child: Column(
                          children: [
                            Text(
                              "Sign In",
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 30,
                              ),
                            ),
                            Text(
                              "Selamat Datang di Radian Edu Solution",
                              style: TextStyle(
                                color: const Color.fromARGB(255, 136, 136, 136),
                                fontSize: Responsive.isMobile(context) ? 12 : 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 30),
                            Container(
                              width: double.infinity,
                              height: 50,
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 243, 243, 243),
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey,
                                    blurRadius: 10,
                                    spreadRadius: 2,
                                    offset: Offset(0, 7),
                                  ),
                                ],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.only(
                                  left: 20,
                                  right: 20,
                                ),
                                child: TextFormField(
                                  cursorColor: Colors.grey,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                    border: InputBorder.none,
                                    hint: Text(
                                      "Email",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(height: 20),
                            Container(
                              width: double.infinity,
                              height: 50,
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 243, 243, 243),
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey,
                                    blurRadius: 10,
                                    spreadRadius: 2,
                                    offset: Offset(0, 7),
                                  ),
                                ],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.only(
                                  left: 20,
                                  right: 20,
                                ),
                                child: TextFormField(
                                  obscureText: true,
                                  cursorColor: Colors.grey,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                    border: InputBorder.none,
                                    hint: Text(
                                      "Password",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(height: 10),
                            Row(
                              children: [
                                Spacer(),
                                TextButton(
                                  onPressed: () {},
                                  child: Text(
                                    "Lupa kata sandi?",
                                    style: TextStyle(color: Colors.blue, fontSize: Responsive.isMobile(context) ? 12 : 14),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 10),
                            Container(
                              width: double.infinity,
                              height: 40,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  backgroundColor: Colors.blue,
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => MainHomepage(),
                                    ),
                                  );
                                },
                                child: Text("Sign In"),
                              ),
                            ),
                            SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    width: double.infinity,
                                    height: 2,
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                                SizedBox(width: 10),
                                Text(
                                  "Atau",
                                  style: TextStyle(color: Colors.black),
                                ),
                                SizedBox(width: 10),
                                Expanded(
                                  child: Container(
                                    width: double.infinity,
                                    height: 2,
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 15),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 55,
                                  height: 55,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(15),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey,
                                        blurRadius: 8,
                                        offset: Offset(0, 5),
                                      ),
                                    ],
                                  ),
                                  child: Icon(
                                    FontAwesome.google,
                                    color: Colors.orange,
                                  ),
                                ),
                                SizedBox(width: 10),
                                Container(
                                  width: 55,
                                  height: 55,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(15),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey,
                                        blurRadius: 8,
                                        offset: Offset(0, 5),
                                      ),
                                    ],
                                  ),
                                  child: Icon(
                                    FontAwesome.facebook,
                                    color: Colors.blue,
                                  ),
                                ),
                              ],
                            ),
                          ],
                      ),
                    ),
                    SizedBox(height: Responsive.isMobile(context) ? 20 : 50),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Belum memiliki akun?",
                          style: TextStyle(color: Colors.black),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: Text(
                            "Daftar",
                            style: TextStyle(color: Colors.blue),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
