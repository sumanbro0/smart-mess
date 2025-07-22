import { getMessBySlugPublicMessSlugPublicGet } from "@/client";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import LoginForm from "@/features/auth/components/login-form";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <CardDescription className="text-base sm:text-lg font-medium text-gray-900">
                Invalid Access Attempt
              </CardDescription>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Please scan the QR code on your table to access the service
                properly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        <LoginForm
          messName={mess.data?.name}
          messLogo={mess.data?.logo}
          slug={subdomain}
          tableId={queryParams.t as string}
        />
      </div>
    </div>
  );
};

export default LoginPage;
