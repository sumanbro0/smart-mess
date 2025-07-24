"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGetAnalyticsApiQueryOptions } from "../use-analytics-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconFlame,
  IconLeaf,
  IconCurrencyDollar,
  IconUsers,
  IconShoppingCart,
  IconBox,
} from "@tabler/icons-react";
import PageHeader from "@/components/page-header";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export const Analytics = ({ messSlug }: { messSlug: string }) => {
  const { data, isLoading, error } = useSuspenseQuery(
    useGetAnalyticsApiQueryOptions(messSlug)
  );
  if (isLoading)
    return (
      <div className="flex flex-col gap-6 items-center w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-6 w-full max-w-4xl">
          <Card>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-destructive text-center py-8 text-lg font-semibold">
        {error.message}
      </div>
    );
  if (!data)
    return (
      <div className="text-muted-foreground text-center py-8 text-lg font-semibold">
        No data
      </div>
    );
  const { overview, top_menu_items, top_customers, currency } = data;
  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="bg-green-100 rounded-full p-2">
              <IconCurrencyDollar className="h-6 w-6 text-green-600" />
            </span>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold flex flex-col gap-1">
            {currency} {overview.revenue.toLocaleString()}
            <span className="text-xs text-muted-foreground font-normal">
              Total revenue generated this period
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="bg-blue-100 rounded-full p-2">
              <IconShoppingCart className="h-6 w-6 text-blue-600" />
            </span>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold flex flex-col gap-1">
            {overview.orders}
            <span className="text-xs text-muted-foreground font-normal">
              Total orders placed
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="bg-yellow-100 rounded-full p-2">
              <IconUsers className="h-6 w-6 text-yellow-600" />
            </span>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold flex flex-col gap-1">
            {overview.customers}
            <span className="text-xs text-muted-foreground font-normal">
              Unique customers served
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="bg-purple-100 rounded-full p-2">
              <IconBox className="h-6 w-6 text-purple-600" />
            </span>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold flex flex-col gap-1">
            {overview.items}
            <span className="text-xs text-muted-foreground font-normal">
              Menu items available
            </span>
          </CardContent>
        </Card>
      </div>
      <div className="w-full max-w-screen-lg flex flex-col gap-8">
        <PageHeader
          title="Top Menu Items"
          description="Here are the top menu items that have been sold the most."
        >
          <></>
        </PageHeader>
        <Card className="shadow-none bg-card/80">
          <CardContent className="p-0">
            <ScrollArea>
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Spicy</TableHead>
                      <TableHead>Veg</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top_menu_items.length ? (
                      top_menu_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Avatar>
                              <AvatarImage src={item.image} alt={item.name} />
                              <AvatarFallback>{item.name[0]}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.category_name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground">
                              {currency} {item.price}
                            </span>
                          </TableCell>
                          <TableCell>{item.sold_count}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <IconFlame className="h-3 w-3 text-muted-foreground" />
                              <Badge
                                variant="outline"
                                className="text-xs font-normal border-muted"
                              >
                                {item.spicy_level.charAt(0).toUpperCase() +
                                  item.spicy_level.slice(1)}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <IconLeaf className="h-3 w-3 text-muted-foreground" />
                              <Badge
                                variant="outline"
                                className="text-xs font-normal border-muted"
                              >
                                {item.is_veg ? "Vegetarian" : "Non-Veg"}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${item.in_stock ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {item.in_stock ? "In Stock" : "Out of Stock"}
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground"
                        >
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <PageHeader
            title="Top Customers"
            description="Here are the top customers who have placed the most orders."
          >
            <></>
          </PageHeader>

          <Card className="shadow-none bg-card/80">
            <CardContent className="p-0">
              <ScrollArea>
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top_customers.length ? (
                        top_customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <Avatar>
                                <AvatarImage
                                  src={customer.image}
                                  alt={customer.name}
                                />
                                <AvatarFallback>
                                  {customer.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {customer.name ? customer.name : "N/A"}
                            </TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.total_orders}</TableCell>
                            <TableCell>
                              <span className="font-medium text-foreground">
                                {currency} {customer.total_spent}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs font-normal border-muted"
                              >
                                {formatDate(customer.last_order_date)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground"
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
