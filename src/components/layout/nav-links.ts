export interface NavSubLink {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
  /** Quando presente, o item vira um dropdown (hover no desktop, toque
   * expande no mobile) — ver navbar.tsx / navbar-menu.tsx. */
  items?: NavSubLink[];
}
