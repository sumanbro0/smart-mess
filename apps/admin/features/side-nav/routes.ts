import {
    IconDashboard,
    IconInnerShadowTop,
    IconListDetails,
    IconChartBar,
    IconUsers,
    IconTable,
    IconCategory,
    IconSettings,
} from "@tabler/icons-react";

import { WhoamiMessSlugWhoamiGetResponse } from "@/client"


type R = WhoamiMessSlugWhoamiGetResponse["role"][]


export const navData = {
    company: {
        name: "Smart Mess.",
        logo: IconInnerShadowTop,
        url: "/",
    },
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "https://github.com/shadcn.png",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
            exactMatch: true, // Only active on exactly /dashboard
            role: ["admin", "owner"] as R,
        },
        {
            title: "Items",
            url: "/items",
            icon: IconListDetails,
            role: ["admin", "owner", "staff"] as R,

        },
        {
            title: "Categories",
            url: "/categories",
            icon: IconCategory,
            role: ["admin", "owner", "staff"] as R,

        },
        {
            title: "Tables",
            url: "/tables",
            icon: IconTable,
            role: ["admin", "owner", "staff"] as R,

        },
        {
            title: "Orders",
            url: "/orders",
            icon: IconChartBar,
            role: ["admin", "owner", "staff"] as R,

        },
        {
            title: "Users",
            url: "/users",
            icon: IconUsers,
            role: ["admin", "owner"] as R,

        },
        {
            title: "Settings",
            url: "/settings",
            icon: IconSettings,
            role: ["admin", "owner"] as R,

        },
    ],
};