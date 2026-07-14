export function getHomePathForRole(role?: string): string {
  switch (role) {
    case "admin":
    case "hrd":
      return "/admin/dashboard";
    case "manajer_training":
      return "/manajer-training/materi";
    case "pimpinan":
      return "/pimpinan/dashboard";
    default:
      return "/dashboard";
  }
}
