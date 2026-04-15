import 'package:flutter/material.dart';
import 'package:hrd_radian/screens/beranda_screen.dart';
import 'package:hrd_radian/screens/lamaran_saya_screen.dart';
import 'package:hrd_radian/screens/lowongan_screen.dart';
import 'package:hrd_radian/widgets/appbar.dart';
import 'package:hrd_radian/utils/responsive.dart';
import 'package:icons_flutter/icons_flutter.dart';

class MainHomepage extends StatefulWidget {
  const MainHomepage({super.key});

  @override
  State<MainHomepage> createState() => _MainHomepageState();
}

class _MainHomepageState extends State<MainHomepage> {
  int currentIndex = 0;

  final List<Widget> daftarHalaman = [
    BerandaScreen(),
    LowonganScreen(),
    LamaranSayaScreen(),
  ];

  void onTap(int index) {
    setState(() {
      currentIndex = index;
    });
    if (Responsive.isMobile(context) && Scaffold.of(context).isDrawerOpen) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: buildAppBar(context, currentIndex: currentIndex, onTap: onTap),
      drawer: Responsive.isMobile(context)
          ? Drawer(
              backgroundColor: Colors.white,
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  DrawerHeader(
                    decoration: BoxDecoration(color: Colors.white),
                    child: Center(
                      child: Image.asset('assets/icons/radian_logo.png', scale: 20),
                    ),
                  ),
                  ListTile(
                    leading: Icon(Icons.home_filled, color: currentIndex == 0 ? Colors.blue : Colors.grey),
                    title: Text("Beranda", style: TextStyle(color: currentIndex == 0 ? Colors.blue : Colors.grey, fontWeight: FontWeight.bold)),
                    onTap: () {
                      onTap(0);
                      Navigator.pop(context); // close drawer
                    },
                  ),
                  ListTile(
                    leading: Icon(Icons.work, color: currentIndex == 1 ? Colors.blue : Colors.grey),
                    title: Text("Lowongan", style: TextStyle(color: currentIndex == 1 ? Colors.blue : Colors.grey, fontWeight: FontWeight.bold)),
                    onTap: () {
                      onTap(1);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: Icon(Elusive.tasks, color: currentIndex == 2 ? Colors.blue : Colors.grey),
                    title: Text("Lamaran saya", style: TextStyle(color: currentIndex == 2 ? Colors.blue : Colors.grey, fontWeight: FontWeight.bold)),
                    onTap: () {
                      onTap(2);
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            )
          : null,
      body: daftarHalaman[currentIndex],
    );
  }
}
