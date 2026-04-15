import 'package:flutter/material.dart';
import 'package:hrd_radian/utils/responsive.dart';
import 'package:icons_flutter/icons_flutter.dart';

class BerandaScreen extends StatefulWidget {
  const BerandaScreen({super.key});

  @override
  State<BerandaScreen> createState() => _BerandaScreenState();
}

class _BerandaScreenState extends State<BerandaScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: Responsive.isMobile(context) ? 20 : 100,
              vertical: Responsive.isMobile(context) ? 30 : 70,
            ),
            child: Column(
              children: [
                _buildHeroBanner(context),
                SizedBox(height: Responsive.isMobile(context) ? 30 : 50),
                
                Wrap(
                  spacing: 20,
                  runSpacing: 20,
                  alignment: WrapAlignment.start,
                  children: [
                    _buildCounterCard("4", "Dilamar", Colors.blue),
                    _buildCounterCard("2", "Wawancara", const Color.fromARGB(255, 89, 89, 89)),
                    _buildCounterCard("2", "Menunggu", const Color.fromARGB(255, 172, 172, 172)),
                    _buildCounterCard("1", "Ditolak", Colors.red),
                  ],
                ),

                SizedBox(height: Responsive.isMobile(context) ? 30 : 50),

                Align(
                  alignment: AlignmentGeometry.topLeft,
                  child: Text(
                    "Lamaran Terbaru",
                    style: TextStyle(
                      color: const Color.fromARGB(255, 91, 91, 91),
                      fontSize: Responsive.isMobile(context) ? 20 : 25,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                SizedBox(height: 20),

                Column(
                  children: [
                    _buildJobCard(
                      title: "Frontend Developer",
                      department: "Engineering",
                      date: "10 Mar 2026",
                      btnLabel: "Tahap Wawancara",
                      btnIcon: Icons.star_border_outlined,
                      btnBgColor: const Color.fromARGB(255, 187, 212, 255),
                      btnColor: Colors.blue,
                    ),
                    SizedBox(height: 30),
                    _buildJobCard(
                      title: "UI/UX Designer",
                      department: "Engineering",
                      date: "10 Mar 2026",
                      btnLabel: "Tahap Wawancara",
                      btnIcon: Octicons.checklist,
                      btnBgColor: const Color.fromARGB(255, 187, 255, 224),
                      btnColor: Colors.green,
                    ),
                    SizedBox(height: 30),
                    _buildJobCard(
                      title: "Data Science",
                      department: "Engineering",
                      date: "10 Mar 2026",
                      btnLabel: "Menunggu",
                      btnIcon: Entypo.clock,
                      btnBgColor: const Color.fromARGB(255, 255, 235, 187),
                      btnColor: const Color.fromARGB(255, 243, 187, 33),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 8,
            spreadRadius: 6,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: Responsive.isMobile(context) ? 20 : 60,
          vertical: Responsive.isMobile(context) ? 30 : 55,
        ),
        child: Responsive.isMobile(context)
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Selamat Malam!",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Selamat datang di SDM Aplikasi Radian Edu Solution",
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  SizedBox(height: 20),
                  SizedBox(
                    height: 50,
                    width: double.infinity,
                    child: _buildLihatLowonganButton(),
                  ),
                ],
              )
            : Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Selamat Malam!",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 37,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          "Selamat datang di SDM Aplikasi Radian Edu Solution",
                          style: TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 70,
                    width: 200,
                    child: _buildLihatLowonganButton(),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildLihatLowonganButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.blue,
        elevation: 7,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      onPressed: () {},
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Lihat lowongan", style: TextStyle(fontWeight: FontWeight.bold)),
          SizedBox(width: 10),
          Icon(Typicons.right),
        ],
      ),
    );
  }

  Widget _buildCounterCard(String count, String label, Color countColor) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double horizontalPadding = Responsive.isMobile(context) ? 20 : 100;
    final double availableWidth = screenWidth - (horizontalPadding * 2);
    final double cardSpacing = 20;

    // Mobile: 2 per row, Desktop/Tablet: 4 per row
    double cardWidth = Responsive.isMobile(context)
        ? (availableWidth - cardSpacing) / 2
        : (availableWidth - (cardSpacing * 3)) / 4;

    return Container(
      height: 120,
      width: cardWidth,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 8,
            spreadRadius: 7,
            offset: const Offset(0, 7),
          ),
        ],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.only(top: 15, left: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              count,
              style: TextStyle(
                color: countColor,
                fontSize: 40,
                fontWeight: FontWeight.bold
              ),
            ),
            Text(
              label,
              style: TextStyle(color: Colors.black, fontSize: 16),
            ),
            SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildJobCard({
    required String title,
    required String department,
    required String date,
    required String btnLabel,
    required IconData btnIcon,
    required Color btnBgColor,
    required Color btnColor,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 8,
            spreadRadius: 8,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      padding: EdgeInsets.all(Responsive.isMobile(context) ? 20 : 40),
      child: Responsive.isMobile(context)
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _buildAvatarBox(),
                    SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              color: Colors.black,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(department, style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 15),
                Row(
                  children: [
                    Icon(Icons.date_range, color: Colors.grey, size: 18),
                    SizedBox(width: 8),
                    Text(date, style: TextStyle(color: Colors.grey)),
                  ],
                ),
                SizedBox(height: 20),
                SizedBox(
                  height: 50,
                  width: double.infinity,
                  child: _buildActionButton(btnLabel, btnIcon, btnBgColor, btnColor),
                ),
              ],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _buildAvatarBox(),
                SizedBox(width: 30),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 23,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 5),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Text(department, style: TextStyle(color: Colors.grey)),
                          SizedBox(width: 15),
                          Icon(Icons.date_range, color: Colors.grey, size: 18),
                          SizedBox(width: 5),
                          Text(date, style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 20),
                SizedBox(
                  height: 60,
                  width: 250,
                  child: _buildActionButton(btnLabel, btnIcon, btnBgColor, btnColor),
                ),
              ],
            ),
    );
  }

  Widget _buildAvatarBox() {
    return Container(
      height: 70,
      width: 70,
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 180, 221, 255),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 8,
            spreadRadius: 5,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: Image.asset("assets/icons/lamaran_icon.png"),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color bgColor, Color textColor) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: bgColor,
        foregroundColor: textColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      onPressed: () {},
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20),
          SizedBox(width: 8),
          Text(label, style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
