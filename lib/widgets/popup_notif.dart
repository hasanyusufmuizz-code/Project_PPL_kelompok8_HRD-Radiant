import 'package:flutter/material.dart';
import 'package:hrd_radian/widgets/builditemnotifikasi.dart';
import 'package:hrd_radian/utils/responsive.dart';

class PopupNotif extends StatelessWidget {
  const PopupNotif({super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentGeometry.topRight,
      child: Padding(
        padding: EdgeInsets.only(
          top: Responsive.isMobile(context) ? 70 : 80, 
          right: Responsive.isMobile(context) ? 20 : 30,
          left: Responsive.isMobile(context) ? 20 : 0,
        ),
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: Responsive.isMobile(context) ? MediaQuery.of(context).size.width - 40 : 350,
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 15,
                  spreadRadius: 2,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Notifikasi",
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: Responsive.isMobile(context) ? 18 : 20,
                  ),
                ),
                SizedBox(height: 15),
                buildItemNotifikasi(
                  teksNotifikasi: "Lamaran Anda untuk Frontend Developer masuk ke Tahap Wawancara.",
                  waktuNotif: "4 jam yang lalu",
                ),
                buildItemNotifikasi(
                  teksNotifikasi: "Anda lulus seleksi admin untuk UI/UX Designer.",
                  waktuNotif: "1 Hari yang lalu",
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
