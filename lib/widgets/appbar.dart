import 'package:flutter/material.dart';
import 'package:hrd_radian/widgets/navappbaritem.dart';
import 'package:hrd_radian/widgets/popup_notif.dart';
import 'package:hrd_radian/utils/responsive.dart';
import 'package:icons_flutter/icons_flutter.dart';

PreferredSizeWidget buildAppBar(BuildContext context, {
  required int currentIndex,
  required Function(int) onTap,
}) {
  double appBarHeight = Responsive.isMobile(context) ? 90 : 120;
  return PreferredSize(
    preferredSize: Size.fromHeight(appBarHeight),
    child: Container(
      height: appBarHeight,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 10,
            spreadRadius: 8,
            offset: Offset(0, 8),
          ),
        ],
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
      ),
      child: SafeArea( // Using SafeArea to avoid notches on mobile
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: Responsive.isMobile(context) ? 15 : 30, 
            vertical: 10
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (Responsive.isMobile(context))
                Builder(
                  builder: (drawerContext) => IconButton(
                    icon: Icon(Icons.menu, color: Colors.black, size: 28),
                    onPressed: () => Scaffold.of(drawerContext).openDrawer(),
                  ),
                ),
              if (Responsive.isMobile(context)) SizedBox(width: 10),
              
              Image.asset('assets/icons/radian_logo.png', scale: Responsive.isMobile(context) ? 50 : 30),

              Spacer(),

              if (!Responsive.isMobile(context))
                Row(
                  children: [
                    navAppBarItem(
                      icon: Icons.home_filled,
                      label: "Beranda",
                      index: 0,
                      currentIndex: currentIndex,
                      onTap: onTap,
                    ),
                    SizedBox(width: 30),
                    navAppBarItem(
                      icon: Icons.work,
                      label: "Lowongan",
                      index: 1,
                      currentIndex: currentIndex,
                      onTap: onTap,
                    ),
                    SizedBox(width: 30),
                    navAppBarItem(
                      icon: Elusive.tasks,
                      label: "Lamaran saya",
                      index: 2,
                      currentIndex: currentIndex,
                      onTap: onTap,
                    ),
                  ],
                ),
              
              if (!Responsive.isMobile(context)) SizedBox(width: 50),
              if (!Responsive.isMobile(context)) Spacer(),

              IconButton(
                onPressed: () {
                  showDialog(
                    context: context, 
                    barrierColor: Colors.transparent,
                    builder: (context) => PopupNotif()
                  );
                },
                icon: Icon(Icons.notifications, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
