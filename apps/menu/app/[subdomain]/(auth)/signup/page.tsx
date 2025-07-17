import { getMessBySlugPublicMessSlugPublicGet } from "@/client";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import LoginForm from "@/features/auth/components/login-form";
import SignupForm from "@/features/auth/components/signup-form";
import { notFound } from "next/navigation";

const LoginPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ t: string }>;
}) => {
  const { subdomain } = await params;
  const queryParams = await searchParams;
  const mess = await getMessBySlugPublicMessSlugPublicGet({
    path: {
      slug: subdomain,
    },
  });

  if (!mess.data?.name) {
    return notFound();
  }

  if (!queryParams.t) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card>
          <CardContent className="max-w-xl">
            <CardDescription className="text-center text-lg font-medium">
              Seem to be an invalid attempt to access the service. Please scan
              the qr code in the table to access the service.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10 h-full bg-gray-50">
      <SignupForm
        messName={mess.data?.name}
        slug={subdomain}
        tableId={queryParams.t as string}
      />
    </div>
  );
};

export default LoginPage;
