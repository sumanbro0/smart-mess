import React from "react";
import { NavUser } from "./nav-user";
import { usersCurrentUserUsersMeGet } from "@/client";

const NavAuth = async () => {
  const user = await usersCurrentUserUsersMeGet();
  return <NavUser user={user.data ?? null} />;
};

export default NavAuth;
