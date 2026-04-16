import 'package:flutter/material.dart';

Widget buildItemNotifikasi({
  required String teksNotifikasi,
  required String waktuNotif
}) {
  return Padding(
    padding: EdgeInsets.only(bottom: 20),

    child: Row(
      children: [

        Container(
          margin: EdgeInsets.only(top: 5),

          width: 10,
          height: 10,

          decoration: BoxDecoration(
            color: Colors.blue,
            shape: BoxShape.circle
          ),
        ),

        SizedBox(width: 12,),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                teksNotifikasi, style: TextStyle(
                  color: Colors.black,
                  fontSize: 14
                ),
              ),

              SizedBox(height: 5,),

              Text(
                waktuNotif, style: TextStyle(
                  fontSize: 12, 
                  fontWeight: FontWeight.bold,
                  color: Colors.blue
                ),
              )
            ],
          )
        )

      ],
    ),
  );
}
