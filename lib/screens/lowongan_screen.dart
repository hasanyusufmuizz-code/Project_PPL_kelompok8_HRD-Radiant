import 'package:flutter/material.dart';
import 'package:hrd_radian/utils/responsive.dart';

class LowonganScreen extends StatefulWidget {
  const LowonganScreen({super.key});

  @override
  State<LowonganScreen> createState() => _LowonganScreenState();
}

class _LowonganScreenState extends State<LowonganScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: Responsive.isMobile(context) ? 20 : 70,
              vertical: Responsive.isMobile(context) ? 30 : 70,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Lowongan yang direkomendasikan",
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: Responsive.isMobile(context) ? 24 : 30,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  "Peluang sesuai dengan profil anda",
                  style: TextStyle(fontSize: Responsive.isMobile(context) ? 16 : 20, color: Colors.grey),
                ),

                SizedBox(height: Responsive.isMobile(context) ? 30 : 40),

                Container(
                  width: double.infinity,
                  height: 60,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey,
                        blurRadius: 7,
                        spreadRadius: 5,
                        offset: const Offset(0, 7),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Icon(Icons.search),
                        SizedBox(width: 20),
                        Expanded(
                          child: TextFormField(
                            cursorColor: Colors.black,
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: "Cari jabatan, departemen, atau kata kunci.....",
                              hintStyle: TextStyle(color: Colors.grey, fontSize: Responsive.isMobile(context) ? 14 : 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 40),

                // Responsive Grid for Job Cards
                Wrap(
                  spacing: 30,
                  runSpacing: 30,
                  alignment: WrapAlignment.start,
                  children: [
                    _buildVacancyCard(
                      title: "Frontend Developer",
                      department: "Engineering",
                      location: "Jakarta, Indonesia",
                      typeLabel: "Penuh Waktu",
                      description: "Mengolah, menganalisis, dan memvisualisasikan data untuk menemukan pola serta mendukung pengambilan keputusan berbasis data.",
                    ),
                    _buildVacancyCard(
                      title: "UI/UX Designer",
                      department: "Designer",
                      location: "Medan, Indonesia",
                      typeLabel: "Penuh Waktu",
                      description: "Mengolah, menganalisis, dan memvisualisasikan data untuk menemukan pola serta mendukung pengambilan keputusan berbasis data.",
                    ),
                    _buildVacancyCard(
                      title: "Data Science",
                      department: "Bussiness Inteligent",
                      location: "Bandung, Indonesia",
                      typeLabel: "Penuh Waktu",
                      description: "Mengolah, menganalisis, dan memvisualisasikan data untuk menemukan pola serta mendukung pengambilan keputusan berbasis data.",
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVacancyCard({
    required String title,
    required String department,
    required String location,
    required String description,
    required String typeLabel,
  }) {
    double cardWidth = Responsive.isMobile(context) ? double.infinity : 400;

    return Container(
      width: cardWidth,
      // Minimal height replaces fixed height, ensuring items fit when wrapped
      constraints: const BoxConstraints(minHeight: 400),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            blurRadius: 7,
            spreadRadius: 2,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildAvatarBox(),
                Spacer(),
                Container(
                  width: 130,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color.fromARGB(255, 166, 233, 255),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.3),
                        blurRadius: 7,
                        spreadRadius: 2,
                        offset: const Offset(0, 4),
                      ),
                    ],
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Text(
                      typeLabel,
                      style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                color: Colors.black,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 5),
            Text(
              department,
              style: TextStyle(color: Colors.grey),
            ),
            SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Icon(Icons.location_on_outlined, color: Colors.grey, size: 20),
                SizedBox(width: 5),
                Text(
                  location,
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
            SizedBox(height: 20),
            Center(
              child: Container(
                height: 1,
                width: double.infinity,
                decoration: BoxDecoration(color: Colors.grey.shade300),
              ),
            ),
            SizedBox(height: 20),
            Text(
              description,
              textAlign: TextAlign.justify,
              style: TextStyle(color: Colors.grey, height: 1.5),
            ),
            SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 40,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  elevation: 5,
                  foregroundColor: Colors.white,
                  backgroundColor: const Color.fromARGB(255, 60, 137, 199),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  )
                ),
                onPressed: () {},
                child: Text("Lamar Sekarang", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarBox() {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 166, 233, 255),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            blurRadius: 6,
            spreadRadius: 2,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Image.asset('assets/icons/lamaran_icon.png'),
    );
  }
}
