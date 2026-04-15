import 'package:flutter/material.dart';

Widget navAppBarItem({
  required IconData icon,
  required String label,
  required int index,
  required int currentIndex,
  required Function(int) onTap,
}) {
  final bool isActive = currentIndex == index;
  return GestureDetector(
    onTap: () => onTap(index),
    child: Row(
      children: [
        Icon(icon, color: isActive ? Colors.blue : Colors.grey),
        SizedBox(width: 10),
        Text(
          label,
          style: TextStyle(color: isActive ? Colors.blue : Colors.grey),
        ),
      ],
    ),
  );
}
