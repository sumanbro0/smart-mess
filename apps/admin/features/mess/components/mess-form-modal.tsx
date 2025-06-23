"use client";
import React from "react";
import { MessFormSchema, messFormSchema } from "../schemas/mess-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/features/files/components/file-upload";
import {
  X,
  ExternalLink,
  Building2,
  MapPin,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import MessForm from "./mess-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const MessFormModal = ({
  open,
  onOpenChange,
  title = "Setup Your Mess",
  description = "Configure your mess establishment to get started",
}: MessFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] md:min-w-3xl h-full p-2">
        <DialogHeader className="px-6 py-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(95vh-100px)] ">
          <MessForm isModal />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MessFormModal;
