"use client";

import * as React from "react";
import { Plus, MapPin, DollarSign, Building2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MessFormModal from "@/features/mess/components/mess-form-modal";
import { MessRead } from "@/client";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constant";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { messQueryOptions } from "@/features/mess/api/use-mess-api";
import Link from "next/link";

export function TenantGrid() {
  const { data: messes } = useSuspenseQuery(messQueryOptions);
  const [showMessModal, setShowMessModal] = React.useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {messes.map((mess) => (
          <Link
            key={mess.id}
            href={mess.slug ? `/${mess.slug}/dashboard` : "#"}
            onClick={(e) => {
              if (!mess.slug) {
                e.preventDefault();
                toast.error("Mess slug not found");
              }
            }}
          >
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-gradient-to-br from-background to-muted/80 hover:from-primary/5 hover:to-primary/10">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-background shadow-lg flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20">
                    <Image
                      src={mess.logo ?? DEFAULT_AVATAR}
                      alt={mess.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-foreground line-clamp-2 leading-tight mb-1">
                      {mess.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-primary ">
                      <Globe className="h-3 w-3" />
                      <span>{mess.slug}</span>
                    </div>
                  </div>
                  {mess.currency && (
                    <div>
                      <span className="font-semibold text-primary">
                        {mess.currency}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  {mess.address && (
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground/70 flex-shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">
                        {mess.address}
                      </span>
                    </div>
                  )}
                  {mess.slug && (
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm bg-muted text-muted-foreground px-2.5 py-1 rounded-md border">
                        /{mess.slug}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border"></div>

                <div className="pt-2">
                  <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Click to manage →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Add New Mess Card */}
        <Card
          className="group cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-muted/50 to-background hover:from-primary/5 hover:to-primary/10 hover:shadow-xl"
          onClick={() => setShowMessModal(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-48 p-6 text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold mb-2 text-foreground">
              Create New Mess
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set up a new mess hall for your community
            </p>
            <div className="mt-4  text-primary group-hover:text-primary/80">
              Get started →
            </div>
          </CardContent>
        </Card>
      </div>

      <MessFormModal open={showMessModal} onOpenChange={setShowMessModal} />
    </>
  );
}
